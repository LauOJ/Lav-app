export type AppLanguage = 'ca' | 'es';

export interface User {
    id: number;
    email: string;
    name: string | null;
    language_preference: AppLanguage;
    created_at: string;
}
