import logo from '../assets/papelsoftlogo.png'

function Intro() {
  return (
    <section className="intro-section">
      <div className="intro-card">
        <div className="intro-visual">
          <img src={logo} className="intro-logo" alt="Papelsoft logo" />
        </div>

        <div className="intro-copy">
          <span className="intro-badge">Gestión inteligente</span>
          <h1>Papelsoft</h1>
          <p>
            Centraliza tu inventario con paneles claros, accesos seguros y una experiencia visual moderna.
            Organiza productos, controla existencias y comienza sesión en minutos.
          </p>
          <div className="intro-actions">
            <button className="primary-button">Comenzar</button>
            <button className="secondary-button">Ver inventario</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Intro