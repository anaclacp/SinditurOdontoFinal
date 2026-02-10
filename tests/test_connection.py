"""
Script para testar a conexão com MongoDB Atlas
"""
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / "backend" / ".env"

load_dotenv(ENV_PATH)

uri = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'dental_clinic')

if not uri:
    print("❌ ERRO: MONGO_URL não encontrada no arquivo .env")
    exit(1)

print("🔍 Testando conexão com MongoDB Atlas...")
print(f"📦 Database: {db_name}")
print(f"🔗 URI: {uri[:50]}...") # Mostra só os primeiros 50 caracteres por segurança

try:
    # Criar cliente e conectar
    client = MongoClient(uri, server_api=ServerApi('1'))

    # Testar conexão com ping
    client.admin.command('ping')
    print("\n✅ Conexão bem-sucedida! MongoDB está respondendo.")

    # Pegar o banco de dados
    db = client[db_name]

    # Listar coleções existentes
    collections = db.list_collection_names()

    if collections:
        print(f"\n📚 Coleções encontradas no banco '{db_name}':")
        for col in collections:
            count = db[col].count_documents({})
            print(f"   • {col}: {count} documentos")
    else:
        print(f"\n📭 Banco '{db_name}' está vazio (sem coleções ainda).")
        print("   Isso é normal se for a primeira vez rodando.")

    # Fechar conexão
    client.close()
    print("\n✨ Teste concluído com sucesso!")

except Exception as e:
    print(f"\n❌ ERRO ao conectar com MongoDB:")
    print(f"   {type(e).__name__}: {e}")
    print("\n💡 Verifique:")
    print("   1. A senha no arquivo .env está correta")
    print("   2. O IP está liberado no MongoDB Atlas (Network Access)")
    print("   3. Você tem acesso à internet")
    exit(1)
