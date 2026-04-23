-- Mevcut kullanıcıyı ADMIN olarak güncelle veya yoksa oluştur
INSERT INTO "User" ("id", "email", "name", "role", "emailVerified", "createdAt", "updatedAt")
VALUES (
    'fixed-admin-id', 
    'ahmetnebioglu89@gmail.com', 
    'Ahmet Nebioğlu', 
    'ADMIN', 
    NOW(), 
    NOW(), 
    NOW()
)
ON CONFLICT ("email") 
DO UPDATE SET "role" = 'ADMIN';
