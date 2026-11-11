import React from 'react';

export default function BrandLogo({ className = '', decorative = false, eager = false }) {
  return (
    <span className={`brand-logo ${className}`}>
      <span className="brand-logo-image"><img src="/brand/dollar-logo.png" alt={decorative ? '' : 'Dollar Creative Lab'} decoding="async" loading={eager ? 'eager' : 'lazy'} width="2172" height="724" /></span>    </span>
  );
}
