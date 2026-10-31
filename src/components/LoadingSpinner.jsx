import React from 'react';

const styles = {
  fullPage: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(245,245,240,.65)',
    zIndex: 9999,
  },
  inline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3.5px solid #e2e2e2',
    borderTopColor: '#1B2A4A',
    borderRadius: '50%',
    animation: 'eduSpin .75s linear infinite',
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: 500,
    letterSpacing: '.02em',
  },
};

const keyframes = `@keyframes eduSpin{to{transform:rotate(360deg)}}`;

export default function LoadingSpinner({ fullPage = false, label = 'Loading…', size = 40 }) {
  const Container = fullPage ? 'div' : React.Fragment;
  const containerProps = fullPage ? { style: styles.fullPage } : {};

  return (
    <>
      <style>{keyframes}</style>
      <Container {...containerProps}>
        <div style={fullPage ? styles.wrapper : { ...styles.inline, flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              ...styles.spinner,
              width: size,
              height: size,
            }}
          />
          {label && <span style={styles.label}>{label}</span>}
        </div>
      </Container>
    </>
  );
}
