import os
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import pandas as pd
import requests
import re
from supabase import create_client, Client
from dotenv import load_dotenv
import traceback

# 1. Cargar variables
load_dotenv()

app = Flask(__name__)

# --- CONFIGURACIÓN CORS BLINDADA ---
# Esto permite todo tipo de headers, métodos y orígenes.
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# 2. Configurar Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Faltan credenciales en .env")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"❌ Error Supabase: {e}")
    supabase = None

# --- FUNCIONES DE AYUDA ---
def obtener_seguidores(username):
    if not username: return 0
    username = username.replace("@", "")
    try:
        url = f"https://www.tiktok.com/@{username}"
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            match = re.search(r'"followerCount":(\d+)', response.text)
            if match: return int(match.group(1))
    except: return 0
    return 0

def get_dashboard_logic():
    if not supabase: return None
    # Traer datos
    res_daily = supabase.table('tiktok_daily_stats').select("*").execute()
    daily = res_daily.data if res_daily.data else []
    
    res_age = supabase.table('tiktok_audience_age').select("*").execute()
    age = res_age.data if res_age.data else []

    # KPIs
    df = pd.DataFrame(daily)
    kpis = {"gasto":0, "impresiones":0, "conversiones":0, "clics":0}
    if not df.empty:
        kpis = {
            "gasto": float(df['gasto'].sum()),
            "impresiones": int(df['impresiones'].sum()),
            "conversiones": int(df['conversiones'].sum()),
            "clics": int(df['clics'].sum())
        }
    
    return {
        "status": "success",
        "kpis": kpis,
        "chart_data": daily,
        "audience_data": age,
        "followers": obtener_seguidores('@compipro')
    }

# --- ENDPOINTS ---

# Manejo explícito de OPTIONS para evitar error 404 en preflight
@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.json
        password = data.get('password')
        if str(password).strip() == str(ADMIN_PASSWORD).strip():
            return jsonify({"status": "success", "message": "OK"})
        else:
            return jsonify({"error": "Password incorrecto"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify(get_dashboard_logic() or {"error": "DB Error"})

@app.route('/api/delete_campaign', methods=['POST'])
def delete_camp():
    try:
        camp = request.json.get('campaign')
        if not camp or camp == 'Todas': return jsonify({"error": "Invalido"}), 400
        
        supabase.table('tiktok_daily_stats').delete().eq('campana', camp).execute()
        supabase.table('tiktok_audience_age').delete().eq('campana', camp).execute()
        
        return jsonify(get_dashboard_logic())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/upload', methods=['POST'])
def upload():
    try:
        if 'files[]' not in request.files: return jsonify({"error": "No files"}), 400
        
        files = request.files.getlist('files[]')
        campana = request.form.get('campaign', 'General')
        user = request.form.get('username', '@compipro')
        
        mapa = {'Por día':'fecha','Coste':'gasto','Impresiones':'impresiones','Clics (destino)':'clics','Conversiones':'conversiones','Edad':'edad'}

        for f in files:
            try:
                df = pd.read_csv(f) if f.filename.endswith('.csv') else pd.read_excel(f)
                
                # Proceso Diario
                if 'Por día' in df.columns:
                    cols = [c for c in mapa.keys() if c in df.columns]
                    df_c = df[cols].rename(columns=mapa)
                    df_c['nombre_anuncio'] = f.filename.split('.')[0].replace("COMPIPRO-Daily Ad Report-","")
                    df_c['usuario_tiktok'] = user
                    df_c['campana'] = campana
                    if 'fecha' in df_c.columns: df_c['fecha'] = pd.to_datetime(df_c['fecha'], errors='coerce').dt.strftime('%Y-%m-%d')
                    df_c = df_c.fillna(0)
                    
                    # Convertir tipos
                    for c in ['impresiones','clics','conversiones']:
                        if c in df_c.columns: df_c[c] = df_c[c].astype(int)
                    if 'gasto' in df_c.columns: df_c['gasto'] = df_c['gasto'].astype(float)
                    
                    supabase.table('tiktok_daily_stats').insert(df_c.to_dict(orient='records')).execute()
                
                # Proceso Edad
                elif 'Edad' in df.columns:
                    cols = [c for c in mapa.keys() if c in df.columns]
                    df_c = df[cols].rename(columns=mapa)
                    df_c['archivo_origen'] = f.filename
                    df_c['usuario_tiktok'] = user
                    df_c['campana'] = campana
                    df_c = df_c.fillna(0)
                    
                    for c in ['impresiones','clics','conversiones']:
                        if c in df_c.columns: df_c[c] = df_c[c].astype(int)
                    if 'gasto' in df_c.columns: df_c['gasto'] = df_c['gasto'].astype(float)
                    
                    supabase.table('tiktok_audience_age').insert(df_c.to_dict(orient='records')).execute()
                    
            except Exception as e:
                print(f"Error file {f.filename}: {e}")
                continue

        return jsonify(get_dashboard_logic())
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

if __name__ == '__main__':
    app.run(debug=False, port=5000)