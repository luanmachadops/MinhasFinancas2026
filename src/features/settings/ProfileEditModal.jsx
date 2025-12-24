import React, { useState, useRef } from 'react';
import { User, Mail, Phone, Camera, Edit3, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { NeoButton, NeoInput, ModalOverlay } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export const ProfileEditModal = ({ onClose }) => {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(user?.user_metadata?.avatar_url || '');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: user?.user_metadata?.name || '',
        phone: user?.user_metadata?.phone || '',
        avatar_url: user?.user_metadata?.avatar_url || ''
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resizeImage = (file, maxHeight = 500) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions maintaining aspect ratio
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, file.type, 0.9); // 0.9 quality
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const uploadAvatar = async (file) => {
        try {
            setUploading(true);

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem válido.');
                return null;
            }

            // Resize image to max 500px height
            const resizedBlob = await resizeImage(file);

            // Delete old avatar if exists
            if (formData.avatar_url) {
                const oldPath = formData.avatar_url.split('/').slice(-2).join('/');
                await supabase.storage.from('avatars').remove([oldPath]);
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar_${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            // Upload resized image
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, resizedBlob, {
                    contentType: file.type,
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return data.publicUrl;

        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Erro ao fazer upload da imagem: ' + error.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to Supabase
        const publicUrl = await uploadAvatar(file);
        if (publicUrl) {
            handleChange('avatar_url', publicUrl);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await updateProfile({
                name: formData.name,
                phone: formData.phone,
                avatar_url: formData.avatar_url
            });
            setIsEditing(false);
            alert('Perfil atualizado com sucesso!');
            onClose(); // Fecha o modal
            window.location.reload(); // Recarrega para atualizar avatar em todos os lugares
        } catch (error) {
            alert('Erro ao atualizar perfil: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.user_metadata?.name || '',
            phone: user?.user_metadata?.phone || '',
            avatar_url: user?.user_metadata?.avatar_url || ''
        });
        setPreviewUrl(user?.user_metadata?.avatar_url || '');
        setIsEditing(false);
    };

    const getInitials = () => {
        if (formData.name) {
            return formData.name.charAt(0).toUpperCase();
        }
        return user?.email?.charAt(0).toUpperCase() || 'U';
    };

    return (
        <ModalOverlay title="Perfil do Usuário" onClose={onClose}>
            <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover border-4 border-slate-800"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white border-4 border-slate-800"
                            style={{ display: previewUrl ? 'none' : 'flex' }}
                        >
                            {getInitials()}
                        </div>

                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute -bottom-2 -right-2 p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                                {uploading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4 text-white" />
                                )}
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {isEditing && (
                        <div className="text-center">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                                <Upload className="w-3 h-3" />
                                {uploading ? 'Enviando...' : 'Fazer upload de foto'}
                            </button>
                            <p className="text-[10px] text-slate-500 mt-1">
                                Redimensionado automaticamente • JPG, PNG, GIF
                            </p>
                        </div>
                    )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    <NeoInput
                        label="Nome"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        disabled={!isEditing}
                        icon={User}
                    />

                    <NeoInput
                        label="Telefone"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        disabled={!isEditing}
                        icon={Phone}
                    />

                    <div className="relative">
                        <NeoInput
                            label="Email"
                            value={user?.email || ''}
                            disabled={true}
                            icon={Mail}
                        />
                        <div className="absolute top-0 right-0 mt-1">
                            <span className="text-[10px] text-slate-500 bg-slate-900/80 px-2 py-0.5 rounded">
                                Não editável
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    {!isEditing ? (
                        <>
                            <NeoButton
                                onClick={() => setIsEditing(true)}
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                <Edit3 className="w-4 h-4" />
                                Editar
                            </NeoButton>
                            <NeoButton
                                onClick={onClose}
                                variant="ghost"
                                className="flex-1"
                            >
                                Fechar
                            </NeoButton>
                        </>
                    ) : (
                        <>
                            <NeoButton
                                onClick={handleSave}
                                disabled={loading || uploading}
                                className="flex-1 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {loading ? 'Salvando...' : 'Salvar'}
                            </NeoButton>
                            <NeoButton
                                onClick={handleCancel}
                                variant="ghost"
                                className="flex-1 flex items-center justify-center gap-2"
                                disabled={loading || uploading}
                            >
                                <X className="w-4 h-4" />
                                Cancelar
                            </NeoButton>
                        </>
                    )}
                </div>

                {/* Info Note */}
                <p className="text-[10px] text-slate-500 text-center italic px-2">
                    * O email não pode ser alterado por questões de segurança
                </p>
            </div>
        </ModalOverlay>
    );
};
