const Banner = () => {
  return (
    <div className="banner">
      <div className="banner-copy">
        <p className="banner-eyebrow">WELCOME TO RHS HOTELS <span /></p>
        <h1>Find Your Perfect Stay</h1>
        <p className="banner-lead">Comfortable stays, memorable experiences - in the heart of Salem.</p>
        <div className="hero-benefits" aria-label="Our benefits">
          <span><b>✓</b> Verified Hotels</span>
          <span><b>★</b> Best Prices</span>
          <span><b>◉</b> 24/7 Support</span>
        </div>
      </div>
      <div className="hero-dots" aria-hidden="true"><i /><i /><i /></div>
    </div>
  )
}

export default Banner
