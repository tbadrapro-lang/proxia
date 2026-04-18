export default function StickyMobileCTA() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) {
      window.location.href = `/#${id}`;
      return;
    }
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-violet-100 px-4 py-3 flex gap-3">
      <a href="tel:0674314575"
        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-medium text-sm rounded-xl py-3">
        📞 Appeler
      </a>
      <button
        onClick={() => scrollTo('reservation')}
        className="flex-1 bg-violet-600 text-white font-medium text-sm rounded-xl py-3">
        Réserver un appel
      </button>
    </div>
  );
}
