-- Configuração do Bucket de Avatars no Supabase Storage
-- Execute estes comandos no SQL Editor do Supabase Dashboard

-- 1. Criar bucket 'avatars' (se não existir)
-- Vá em Storage > Create a new bucket
-- Nome: avatars
-- Public bucket: Yes (para URLs públicas)

-- 2. Configurar políticas de acesso (RLS)
-- Cole os seguintes comandos no SQL Editor:

-- Permitir upload apenas para própria pasta do usuário
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir leitura pública de avatars
CREATE POLICY "Public access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Permitir atualização apenas dos próprios arquivos
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir deletar apenas próprios avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- IMPORTANTE: Após executar estes comandos, teste fazendo upload de uma imagem
