import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(next);
  };

  const current = languages.find((l) => l.code === i18n.language) ?? languages[0];

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium
                 text-gray-600 hover:bg-gray-100 transition-colors"
      title={i18n.language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <Globe className="w-4 h-4" />
      <span>{current.label}</span>
    </button>
  );
}
