/**
 * Auth Modal Component
 *
 * Sign-in / sign-up dialog built from BHMUI primitives (modal, input, button).
 * Handles email+password validation and Google OAuth initiation.
 * All routing to the actual auth backend is done via the provided callbacks —
 * this component contains no network logic.
 *
 * @example
 * ```typescript
 * const auth = new authmodal({
 *   onSignIn: (email, password) => api.login(email, password),
 *   onSignUp: (email, password) => api.register(email, password),
 *   onGoogleLogin: () => api.googleOAuth(),
 * });
 * auth.open();
 * ```
 */

import type { widgetmeta } from './widget-meta';
import { modal } from './modal';
import { input } from './input';
import { button } from './button';

export interface authmodaloptions {
  onSignIn?: (email: string, password: string) => void;
  onSignUp?: (email: string, password: string) => void;
  onGoogleLogin?: () => void;
  onClose?: () => void;
}

export class authmodal {
  static meta: widgetmeta = {
    name: 'auth-modal',
    description: 'Sign-in / sign-up dialog with email, password, and Google OAuth support',
    category: 'overlay',
    defaultOptions: {},
  };

  private m: modal;
  private opts: authmodaloptions;
  private isSignUp = false;

  // Re-used input instances so values persist across toggleMode()
  private emailInput: input;
  private passwordInput: input;
  private confirmInput: input | null = null;

  constructor(options: authmodaloptions = {}) {
    this.opts = options;

    this.emailInput = new input({
      type: 'email',
      label: 'Email',
      placeholder: 'you@example.com',
      icon: ICON_MAIL,
      iconPosition: 'left',
    });

    this.passwordInput = new input({
      type: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      icon: ICON_LOCK,
      iconPosition: 'left',
    });

    this.m = new modal({
      title: 'Sign In',
      content: this.buildForm(),
      maxWidth: 'md',
      onClose: options.onClose,
    });
  }

  private buildForm(): HTMLElement {
    const form = document.createElement('form');
    form.style.cssText = 'display:flex;flex-direction:column;gap:16px;';
    form.addEventListener('submit', e => this.handleSubmit(e));

    this.emailInput = new input({
      type: 'email',
      label: 'Email',
      placeholder: 'you@example.com',
      icon: ICON_MAIL,
      iconPosition: 'left',
    });

    this.passwordInput = new input({
      type: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      icon: ICON_LOCK,
      iconPosition: 'left',
    });

    form.appendChild(this.emailInput.element);
    form.appendChild(this.passwordInput.element);

    // Confirm password slot — hidden until sign-up mode
    const confirmSlot = document.createElement('div');
    confirmSlot.id = 'confirm-slot';
    confirmSlot.style.display = 'none';
    form.appendChild(confirmSlot);

    // Buttons
    const submitBtn = new button({ text: 'Sign In', variant: 'primary', type: 'submit', fullWidth: true });
    const toggleBtn = new button({
      text: "Don't have an account? Sign Up",
      variant: 'secondary',
      fullWidth: true,
      onClick: () => this.toggleMode(form),
    });

    form.appendChild(submitBtn.element);
    form.appendChild(toggleBtn.element);

    // Divider
    const divider = document.createElement('div');
    divider.style.cssText = 'display:flex;align-items:center;gap:12px;';
    divider.innerHTML = `
      <div style="flex:1;height:1px;background:var(--color-border-default,#e5e7eb);"></div>
      <span style="font-family:var(--font-human,sans-serif);font-size:0.75rem;color:var(--color-text-subtle,#9ca3af);white-space:nowrap;">Or continue with</span>
      <div style="flex:1;height:1px;background:var(--color-border-default,#e5e7eb);"></div>
    `;
    form.appendChild(divider);

    // Google button
    const googleBtn = new button({
      text: 'Continue with Google',
      variant: 'outline',
      icon: ICON_GOOGLE,
      iconPosition: 'left',
      fullWidth: true,
      onClick: () => this.opts.onGoogleLogin?.(),
    });
    form.appendChild(googleBtn.element);

    return form;
  }

  private toggleMode(form: HTMLFormElement): void {
    this.isSignUp = !this.isSignUp;

    // Update modal title
    const title = this.m.element.querySelector('h2');
    if (title) title.textContent = this.isSignUp ? 'Create Account' : 'Sign In';

    // Toggle confirm password
    const confirmSlot = form.querySelector('#confirm-slot') as HTMLDivElement;
    if (this.isSignUp) {
      if (!this.confirmInput) {
        this.confirmInput = new input({
          type: 'password',
          label: 'Confirm Password',
          placeholder: 'Repeat your password',
          icon: ICON_LOCK,
          iconPosition: 'left',
        });
        confirmSlot.appendChild(this.confirmInput.element);
      }
      confirmSlot.style.display = 'block';
    } else {
      confirmSlot.style.display = 'none';
    }

    // Update submit button text
    const submitBtn = form.querySelector('button[type="submit"] span');
    if (submitBtn) submitBtn.textContent = this.isSignUp ? 'Sign Up' : 'Sign In';

    // Update toggle button text
    const btns = form.querySelectorAll('button[type="button"] span');
    if (btns[0]) {
      btns[0].textContent = this.isSignUp
        ? 'Already have an account? Sign In'
        : "Don't have an account? Sign Up";
    }

    // Clear errors
    this.emailInput.setError(undefined);
    this.passwordInput.setError(undefined);
    this.confirmInput?.setError(undefined);
  }

  private handleSubmit(e: Event): void {
    e.preventDefault();

    const email = this.emailInput.getValue().trim();
    const password = this.passwordInput.getValue();
    const confirm = this.confirmInput?.getValue() ?? '';

    let valid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      this.emailInput.setError('Please enter a valid email');
      valid = false;
    } else {
      this.emailInput.setError(undefined);
    }

    if (!password || password.length < 8) {
      this.passwordInput.setError('Password must be at least 8 characters');
      valid = false;
    } else {
      this.passwordInput.setError(undefined);
    }

    if (this.isSignUp && password !== confirm) {
      this.confirmInput?.setError('Passwords do not match');
      valid = false;
    } else {
      this.confirmInput?.setError(undefined);
    }

    if (!valid) return;

    if (this.isSignUp) {
      this.opts.onSignUp?.(email, password);
    } else {
      this.opts.onSignIn?.(email, password);
    }
  }

  open(): void {
    this.m.open();
  }

  close(): void {
    this.m.close();
  }

  destroy(): void {
    this.m.destroy();
  }
}

// ─── SVG icons ────────────────────────────────────────────────────────────────

const ICON_MAIL = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
</svg>`;

const ICON_LOCK = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
</svg>`;

const ICON_GOOGLE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
</svg>`;
