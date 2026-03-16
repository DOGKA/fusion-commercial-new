/**
 * Email Templates - Index
 * Export all email templates and utilities
 */

// Templates
export { ActivationEmail } from "./templates/ActivationEmail";
export { PasswordResetEmail } from "./templates/PasswordResetEmail";
export { OrderConfirmationEmail } from "./templates/OrderConfirmationEmail";
export { OrderPendingPaymentEmail } from "./templates/OrderPendingPaymentEmail";
export { OrderShippedEmail } from "./templates/OrderShippedEmail";
export { OrderStatusEmail } from "./templates/OrderStatusEmail";
export { InvoiceReadyEmail } from "./templates/InvoiceReadyEmail";
export { PaymentConfirmedEmail } from "./templates/PaymentConfirmedEmail";
export { CartReminderEmail } from "./templates/CartReminderEmail";
export { AdminNewOrderEmail } from "./templates/AdminNewOrderEmail";

// Components
export { Layout } from "./components/Layout";
export { LOGO_URL, LOGO_WIDTH, LOGO_HEIGHT, LogoInline } from "./components/Logo";
export * from "./components/shared";

// Utils
export * from "./utils/mask";

// Theme
export { theme, commonStyles } from "./styles/theme";

