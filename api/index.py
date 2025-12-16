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
        response = requests.get(url, headers=headers, timeout=3) # Timeout reducido a 3s para no bloquear
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
        
        # MEJORA 1: Usar listas para acumular (es más rápido que DataFrames vacíos)
        lista_diarios = []
        lista_edades = []
        
        # MEJORA 2: Definir columnas estrictamente necesarias para ahorrar memoria
        cols_necesarias = ['Por día', 'Coste', 'Impresiones', 'Clics (destino)', 'Conversiones', 'Edad']

        for file in uploaded_files:
            filename = file.filename
            
            try:
                # Lectura optimizada
                if filename.endswith('.csv'):
                    df = pd.read_csv(file)
                else:
                    # MEJORA 3: Usar engine openpyxl explícito
                    df = pd.read_excel(file, engine='openpyxl')

                # PROCESO REPORTE DIARIO
                if 'Por día' in df.columns:
                    # Filtramos solo lo útil antes de procesar
                    cols_actuales = [c for c in cols_necesarias if c in df.columns]
                    df_filtrado = df[cols_actuales].copy()
                    
                    renombres = {
                        'Por día': 'fecha', 
                        'Coste': 'gasto', 
                        'Impresiones': 'impresiones',
                        'Clics (destino)': 'clics', 
                        'Conversiones': 'conversiones'
                    }
                    df_filtrado = df_filtrado.rename(columns=renombres)
                    
                    nombre_clean = filename.split('.')[0].replace("COMPIPRO-Daily Ad Report-", "")
                    df_filtrado['nombre_anuncio'] = nombre_clean
                    
                    # Convertir fecha de una vez
                    if 'fecha' in df_filtrado.columns:
                        df_filtrado['fecha'] = pd.to_datetime(df_filtrado['fecha'], errors='coerce').dt.strftime('%Y-%m-%d')
                    
                    lista_diarios.append(df_filtrado)
                
                # PROCESO REPORTE EDAD
                elif 'Edad' in df.columns:
                    lista_edades.append(df)
            
            except Exception as e:
                print(f"Saltando archivo corrupto {filename}: {e}")
                continue

        # MEJORA 4: Concatenar todo UNA SOLA VEZ al final
        df_diario_total = pd.concat(lista_diarios, ignore_index=True) if lista_diarios else pd.DataFrame()
        df_edad_total = pd.concat(lista_edades, ignore_index=True) if lista_edades else pd.DataFrame()

        # Relleno de ceros y seguridad
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
        print(f"Error critico: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)