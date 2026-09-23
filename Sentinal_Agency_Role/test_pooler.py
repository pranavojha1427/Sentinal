import psycopg2

region = "aws-0-ap-southeast-1.pooler.supabase.com"
print(f"Trying {region} with bracket password...")
try:
    conn = psycopg2.connect(
        host=region,
        port=6543,
        dbname="postgres",
        user="postgres.ygbtrapskuguoagegftn",
        password="[SentinalForce@1427]",
        connect_timeout=3
    )
    print(f"Connected to {region}!")
    conn.close()
except Exception as e:
    print(e)
