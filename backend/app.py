from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
import re

app = Flask(__name__)
CORS(app)

def obtener_seguidores(username):
    if not username: return 0
    username = username.replace("@", "")
    url = f"https://www.tiktok.com/@{username}"
    headers = {'User-Agent': 'Mozilla/5.0'}
    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            patron = r'"followerCount":(\d+)'
            match = re.search(patron, response.text)
            if match: return int(match.group(1))
    except:
        return 0
    return 0

@app.route('/api/upload', methods=['POST'])
def process_dashboard():
    try:
        if 'files[]' not in request.files:
            return jsonify({"error": "No files"}), 400
        
        uploaded_files = request.files.getlist('files[]')
        df_diario_total = pd.DataFrame()
        df_edad_total = pd.DataFrame()
        
        for file in uploaded_files:
            filename = file.filename
            if filename.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)

            if 'Por día' in df.columns:
                renombres = {
                    'Por día': 'fecha', 
                    'Coste': 'gasto', 
                    'Impresiones': 'impresiones',
                    'Clics (destino)': 'clics', 
                    'Conversiones': 'conversiones',
                    'CTR': 'ctr_source', 
                    'CPC': 'cpc_source' 
                }
                df = df.rename(columns=renombres)
                
                nombre_clean = filename.split('.')[0].replace("COMPIPRO-Daily Ad Report-", "")
                df['nombre_anuncio'] = nombre_clean
                df['fecha'] = pd.to_datetime(df['fecha']).dt.strftime('%Y-%m-%d')
                
                df_diario_total = pd.concat([df_diario_total, df], ignore_index=True)
            
            elif 'Edad' in df.columns:
                df_edad_total = df.copy()

        df_diario_total = df_diario_total.fillna(0)
        df_edad_total = df_edad_total.fillna(0)

        kpis = {
            "gasto": float(df_diario_total['gasto'].sum()) if 'gasto' in df_diario_total else 0,
            "impresiones": int(df_diario_total['impresiones'].sum()) if 'impresiones' in df_diario_total else 0,
            "conversiones": int(df_diario_total['conversiones'].sum()) if 'conversiones' in df_diario_total else 0,
            "clics": int(df_diario_total['clics'].sum()) if 'clics' in df_diario_total else 0
        }
        
        chart_data = df_diario_total.to_dict(orient='records')
        audience_data = df_edad_total.to_dict(orient='records')
        
        user_tiktok = request.form.get('username', '@compipro')
        followers = obtener_seguidores(user_tiktok)

        return jsonify({
            "status": "success",
            "kpis": kpis,
            "chart_data": chart_data,  
            "audience_data": audience_data,
            "followers": followers
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)