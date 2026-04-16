export type AppLanguage = 'ca' | 'es';

export interface User {
    id: number;
    email: string;
    language_preference: AppLanguage;
    created_at: string;
}
