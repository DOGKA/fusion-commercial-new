"use client";

/**
 * Giriş / kayıt panelleri
 *
 * Bu dosyanın gövdesi page.tsx'ten (satır 92-176, 184-185, 364-1021) BİREBİR
 * çıkarılmıştır. Tasarım korunur; erişilebilirlik nitelikleri ve kontrast
 * düzeltmeleri görsel düzeni değiştirmeden uygulanabilir.
 *
 * Oturumsuz /hesabim kökünde AccountShellGate tarafından kabuk olmadan
 * render edilir.
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Eye, EyeOff, Shield, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type ActivePanel = "login" | "register" | null;

export default function AuthPanels() {
  const { login, loginWithGoogle, register } = useAuth();

  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");
  const [passwordStep, setPasswordStep] = useState<"first" | "confirm">("first");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loginHover, setLoginHover] = useState(false);
  const [registerHover, setRegisterHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);

  // Clear errors when panel changes (using ref to track changes)
  const prevActivePanelRef = useRef(activePanel);
  useEffect(() => {
    if (prevActivePanelRef.current !== activePanel) {
      prevActivePanelRef.current = activePanel;
      queueMicrotask(() => {
        setLoginError(null);
        setRegisterError(null);
      });
    }
  }, [activePanel]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword);
    if (!result.success) setLoginError(result.error || "Giriş başarısız");
    setLoginLoading(false);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setPasswordMismatch(false);

    if (passwordStep === "first") {
      if (registerPassword.length < 8) {
        setRegisterError("Parola en az 8 karakter olmalıdır");
        return;
      }
      setPasswordStep("confirm");
      setShowRegisterPassword(false);
      return;
    }

    if (registerPassword !== registerPasswordConfirm) {
      setPasswordMismatch(true);
      setRegisterPasswordConfirm("");
      return;
    }

    setRegisterLoading(true);
    const result = await register({
      email: registerEmail,
      password: registerPassword,
      name: registerName,
      newsletter,
    });
    if (!result.success) {
      setRegisterError(result.error || "Kayıt başarısız");
    } else {
      await login(registerEmail, registerPassword);
    }
    setRegisterLoading(false);
  };
  const activateLogin = () => setActivePanel("login");
  const activateRegister = () => setActivePanel("register");
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      paddingTop: '120px',
      paddingBottom: '80px',
    }}>
      {/* Background Gradient */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.06) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 24px',
        position: 'relative',
      }}>
        {/* Page Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: 'var(--foreground)',
          textAlign: 'center',
          marginBottom: '48px',
        }}>
          Hesabım
        </h1>

        {/* Two Column Layout */}
        <div 
          className="auth-forms-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '48px',
          }}
        >
          
          {/* LEFT - Giriş Yap */}
          <div 
            onClick={activateLogin}
            style={{
              backgroundColor: 'var(--surface-overlay)',
              border: activePanel === 'login'
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid var(--glass-border)',
              borderRadius: '24px',
              padding: '40px',
              opacity: activePanel === 'register' ? 0.4 : 1,
              transition: 'all 0.3s ease',
              cursor: activePanel === 'register' ? 'pointer' : 'default',
              transform: activePanel === 'login' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: activePanel === 'login' ? '0 8px 32px rgba(16, 185, 129, 0.1)' : 'none',
            }}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--foreground)',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              Giriş Yap
              {activePanel === 'login' && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                }}/>
              )}
            </h2>

            <form onSubmit={handleLogin}>
              {/* Error Message */}
              {loginError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#EF4444',
                }}>
                  {loginError}
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="login-email" style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--foreground-secondary)',
                  marginBottom: '8px',
                }}>
                  E-posta adresi <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  onFocus={() => { setFocusedField('loginEmail'); activateLogin(); }}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={activePanel === 'register' || loginLoading}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'var(--input-bg)',
                    border: focusedField === 'loginEmail'
                      ? '1px solid rgba(16, 185, 129, 0.5)'
                      : '1px solid var(--input-border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'var(--foreground)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: activePanel === 'register' ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="login-password" style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--foreground-secondary)',
                  marginBottom: '8px',
                }}>
                  Parola <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    onFocus={() => { setFocusedField('loginPassword'); activateLogin(); }}
                    onBlur={() => setFocusedField(null)}
                    required
                    disabled={activePanel === 'register' || loginLoading}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 48px 0 16px',
                      backgroundColor: 'var(--input-bg)',
                      border: focusedField === 'loginPassword'
                        ? '1px solid rgba(16, 185, 129, 0.5)'
                        : '1px solid var(--input-border)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: 'var(--foreground)',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      cursor: activePanel === 'register' ? 'not-allowed' : 'text',
                    }}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={activePanel === 'register'}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--foreground-muted)',
                      cursor: activePanel === 'register' ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '28px',
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: activePanel === 'register' ? 'not-allowed' : 'pointer',
                  opacity: activePanel === 'register' ? 0.5 : 1,
                }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    disabled={activePanel === 'register' || loginLoading}
                    className="sr-only"
                  />
                  <div
                    aria-hidden="true"
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: rememberMe ? '2px solid #10B981' : '2px solid var(--border-secondary)',
                      backgroundColor: rememberMe ? '#10B981' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: activePanel === 'register' ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {rememberMe && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--foreground-secondary)' }}>
                    Beni hatırla
                  </span>
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={activePanel === 'register' || loginLoading}
                onMouseEnter={() => setLoginHover(true)}
                onMouseLeave={() => setLoginHover(false)}
                style={{
                  width: '100%',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: activePanel === 'register' ? 'var(--btn-secondary-bg)' : (loginHover ? '#065F46' : '#047857'),
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activePanel === 'register' ? 'var(--foreground-disabled)' : 'white',
                  cursor: activePanel === 'register' || loginLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '16px',
                }}
              >
                {loginLoading && <Loader2 size={18} className="animate-spin" />}
                {loginLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>

              {/* Forgot Password Link */}
              <div style={{ textAlign: 'center' }}>
                <Link 
                  href="/sifremi-unuttum" 
                  style={{
                    fontSize: '13px',
                    color: 'var(--fusion-success-text)',
                    textDecoration: 'none',
                    pointerEvents: activePanel === 'register' ? 'none' : 'auto',
                    opacity: activePanel === 'register' ? 0.5 : 1,
                  }}
                >
                  Parolanızı mı unuttunuz?
                </Link>
              </div>

              {/* Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                margin: '24px 0',
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>veya</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={activePanel === 'register'}
                onMouseEnter={() => setGoogleHover(true)}
                onMouseLeave={() => setGoogleHover(false)}
                style={{
                  width: '100%',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  backgroundColor: googleHover && activePanel !== 'register' ? 'var(--glass-bg-hover)' : 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: activePanel === 'register' ? 'var(--foreground-disabled)' : 'var(--foreground)',
                  cursor: activePanel === 'register' ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ opacity: activePanel === 'register' ? 0.3 : 1 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google ile Devam</span>
              </button>
            </form>
          </div>

          {/* RIGHT - Üye Ol */}
          <div 
            onClick={activateRegister}
            style={{
              backgroundColor: 'var(--surface-overlay)',
              border: activePanel === 'register'
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid var(--glass-border)',
              borderRadius: '24px',
              padding: '40px',
              opacity: activePanel === 'login' ? 0.7 : 1,
              transition: 'all 0.3s ease',
              cursor: activePanel === 'login' ? 'pointer' : 'default',
              transform: activePanel === 'register' ? 'scale(1.02)' : 'scale(1)',
              boxShadow: activePanel === 'register' ? '0 8px 32px rgba(16, 185, 129, 0.1)' : 'none',
            }}
          >
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--foreground)',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              Üye Ol
              {activePanel === 'register' && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                }}/>
              )}
            </h2>

            <form onSubmit={handleRegister}>
              {/* Error Message */}
              {registerError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                  color: '#EF4444',
                }}>
                  {registerError}
                </div>
              )}

              {/* Name */}
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="register-name" style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--foreground-secondary)',
                  marginBottom: '8px',
                }}>
                  Ad Soyad
                </label>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  onFocus={() => { setFocusedField('registerName'); activateRegister(); }}
                  onBlur={() => setFocusedField(null)}
                  disabled={activePanel === 'login' || registerLoading}
                  placeholder="İsteğe bağlı"
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'var(--input-bg)',
                    border: focusedField === 'registerName'
                      ? '1px solid rgba(16, 185, 129, 0.5)'
                      : '1px solid var(--input-border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'var(--foreground)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: activePanel === 'login' ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="register-email" style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--foreground-secondary)',
                  marginBottom: '8px',
                }}>
                  E-posta adresi <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  onFocus={() => { setFocusedField('registerEmail'); activateRegister(); }}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={activePanel === 'login' || registerLoading}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    backgroundColor: 'var(--input-bg)',
                    border: focusedField === 'registerEmail'
                      ? '1px solid rgba(16, 185, 129, 0.5)'
                      : '1px solid var(--input-border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: 'var(--foreground)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    cursor: activePanel === 'login' ? 'not-allowed' : 'text',
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label htmlFor="register-password" style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: passwordStep === 'confirm' ? 'var(--fusion-success-text)' : 'var(--foreground-secondary)',
                  }}>
                    {passwordStep === 'first' ? (
                      <>Parola <span style={{ color: '#EF4444' }}>*</span></>
                    ) : (
                      'Lütfen şifrenizi tekrar girin'
                    )}
                  </label>
                  {passwordStep === 'confirm' && (
                    <button
                      type="button"
                      onClick={() => { setPasswordStep('first'); setRegisterPasswordConfirm(''); setPasswordMismatch(false); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '12px',
                        color: 'var(--foreground-muted)',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Şifreyi değiştir
                    </button>
                  )}
                </div>

                {passwordMismatch && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginBottom: '10px',
                    fontSize: '12px',
                    color: '#EF4444',
                  }}>
                    Şifreler eşleşmiyor. Lütfen tekrar deneyin.
                  </div>
                )}

                <div style={{ position: 'relative' }}>
                  <input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    autoComplete={passwordStep === 'first' ? "new-password" : "new-password"}
                    value={passwordStep === 'first' ? registerPassword : registerPasswordConfirm}
                    onChange={(e) => {
                      setPasswordMismatch(false);
                      if (passwordStep === 'first') {
                        setRegisterPassword(e.target.value);
                      } else {
                        setRegisterPasswordConfirm(e.target.value);
                      }
                    }}
                    onFocus={() => { setFocusedField('registerPassword'); activateRegister(); }}
                    onBlur={() => setFocusedField(null)}
                    required
                    disabled={activePanel === 'login' || registerLoading}
                    placeholder={passwordStep === 'first' ? 'En az 8 karakter' : 'Şifrenizi tekrar girin'}
                    autoFocus={passwordStep === 'confirm'}
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 48px 0 16px',
                      backgroundColor: 'var(--input-bg)',
                      border: passwordMismatch
                        ? '1px solid rgba(239, 68, 68, 0.5)'
                        : passwordStep === 'confirm'
                          ? '1px solid rgba(16, 185, 129, 0.4)'
                          : focusedField === 'registerPassword'
                            ? '1px solid rgba(16, 185, 129, 0.5)'
                            : '1px solid var(--input-border)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      color: 'var(--foreground)',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      cursor: activePanel === 'login' ? 'not-allowed' : 'text',
                    }}
                  />
                  <button
                    type="button"
                    aria-label={showRegisterPassword ? "Parolayı gizle" : "Parolayı göster"}
                    aria-pressed={showRegisterPassword}
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    disabled={activePanel === 'login'}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--foreground-muted)',
                      cursor: activePanel === 'login' ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Newsletter Checkbox */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: activePanel === 'login' ? 'not-allowed' : 'pointer',
                marginBottom: '24px',
                opacity: activePanel === 'login' ? 0.5 : 1,
              }}>
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(event) => setNewsletter(event.target.checked)}
                  disabled={activePanel === 'login' || registerLoading}
                  className="sr-only"
                />
                <div
                  aria-hidden="true"
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    border: newsletter ? '2px solid #10B981' : '2px solid var(--border)',
                    backgroundColor: newsletter ? '#10B981' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    cursor: activePanel === 'login' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {newsletter && <Check size={12} color="white" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--foreground-secondary)', lineHeight: '1.5' }}>
                  Haber bültenimize abone olun (isteğe bağlı)
                </span>
              </label>

              {/* Privacy Text */}
              <p style={{
                fontSize: '12px',
                color: 'var(--foreground-muted)',
                lineHeight: '1.7',
                marginBottom: '28px',
                padding: '16px',
                backgroundColor: 'var(--glass-bg)',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
              }}>
                Kişisel verileriniz, bu web sitesi boyunca deneyiminizi desteklemek, hesabınıza erişimi yönetmek ve diğer amaçlar için kullanılacaktır. Daha fazla bilgi için{' '}
                <Link href="/gizlilik-politikasi" style={{ color: 'var(--fusion-success-text)', textDecoration: 'none' }}>
                  gizlilik politikamızı
                </Link>
                {' '}inceleyebilirsiniz.
              </p>

              {/* Register Button */}
              <button
                type="submit"
                disabled={activePanel === 'login' || registerLoading}
                onMouseEnter={() => setRegisterHover(true)}
                onMouseLeave={() => setRegisterHover(false)}
                style={{
                  width: '100%',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: activePanel === 'login' ? 'var(--btn-ghost-hover)' : (registerHover ? '#065F46' : '#047857'),
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: activePanel === 'login' ? 'var(--foreground-muted)' : 'white',
                  cursor: activePanel === 'login' || registerLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '20px',
                }}
              >
                {registerLoading && <Loader2 size={18} className="animate-spin" />}
                {registerLoading ? 'Kayıt yapılıyor...' : passwordStep === 'first' ? 'Devam Et' : 'Üye Ol'}
              </button>

            </form>
          </div>
        </div>

        {/* Security Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '40px',
        }}>
          <Shield size={14} style={{ color: 'var(--foreground-muted)' }} />
          <span style={{ fontSize: '11px', color: 'var(--foreground-muted)' }}>
            256-bit SSL ile güvenli bağlantı
          </span>
        </div>
      </div>
    </div>
  );
}
