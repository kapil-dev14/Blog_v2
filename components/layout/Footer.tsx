export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-mark">✦</p>

        <p>
          A quiet corner for thoughts, stories,
          <br />
          and things worth remembering.
        </p>

        <span className="footer-year">© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
