export default function Footer() {
  return (
    <footer className="border-t border-cream/10 bg-dark">
      <div className="mx-auto max-w-7xl px-6 py-8 text-center text-sm text-cream/40">
        &copy; {new Date().getFullYear()} Gimme Golf. All rights reserved.
      </div>
    </footer>
  );
}
