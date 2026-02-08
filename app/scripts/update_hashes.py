import psycopg2

DB_PARAMS = {
    'dbname': 'auth_db',
    'user': 'postgres',
    'password': '#Sidd2006',
    'host': 'localhost',
}

HASHES = [
    ("pbkdf2$200000$813643e437eb1a9716b3106ce4a6227a$057635565b9f51972950dac66e491d19854402d2f45c3d766d36d78cc2126ebd", 1002),
    ("pbkdf2$200000$67c262be7b5f07aebb47c5c469100bd4$9d6915fea7ceda18ef1a76537c8b48011cb8186eb22841b57bde83d1407ac1ae", 1001),
    ("pbkdf2$200000$6e0306829459d397868b2f4ad4004b29$3a1ed4d6a92f7c5fe7f31b2b2213dc8a7c02cd4756112eb39a57c51c9007b945", 1003),
]


def main():
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()
    for pw, uid in HASHES:
        cur.execute("UPDATE users_auth SET password_hash = %s WHERE user_id = %s", (pw, uid))
    conn.commit()

    cur.execute("SELECT user_id, length(password_hash) AS len, substring(password_hash for 200) FROM users_auth WHERE user_id IN (1001,1002,1003) ORDER BY user_id")
    rows = cur.fetchall()
    for r in rows:
        print(r)

    cur.close()
    conn.close()


if __name__ == '__main__':
    main()
