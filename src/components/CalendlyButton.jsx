import { PopupButton } from 'react-calendly';

const CALENDLY_URL = 'https://calendly.com/tbadrapro/appel-decouverte-gratuit';

/**
 * Bouton Calendly avec widget pop-up.
 * Wrap n'importe quel contenu (texte, JSX) ; les classes utilitaires
 * s'appliquent au bouton interne via la prop `className`.
 */
export default function CalendlyButton({
  className = '',
  children = 'Réserver un appel',
  url = CALENDLY_URL,
}) {
  // PopupButton attend un text (string). Si children est string on l'utilise direct,
  // sinon on tombe en fallback sur un <a> classique pour conserver le JSX riche.
  if (typeof children !== 'string') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <PopupButton
      url={url}
      rootElement={typeof document !== 'undefined' ? document.getElementById('root') : undefined}
      text={children}
      className={className}
    />
  );
}
