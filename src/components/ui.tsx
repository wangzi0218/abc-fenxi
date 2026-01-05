import React from 'react';

/**
 * Card 组件 - 基础卡片容器
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({ children, className = '', title, headerExtra, footer }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {headerExtra && (
            <div className="flex-shrink-0">
              {headerExtra}
            </div>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * Button 组件
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-gray-300 text-gray-700 hover:border-gray-400',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? '加载中...' : children}
    </button>
  );
}

/**
 * Loading 组件
 */
export function Loading({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClass[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`} />
  );
}

/**
 * Empty State 组件
 */
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">📊</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * Badge 组件
 */
interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

export function Badge({ variant = 'info', children }: BadgeProps) {
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

/**
 * Alert 组件
 */
interface AlertProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
  onClose?: () => void;
}

export function Alert({ type = 'info', title, description, onClose }: AlertProps) {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${typeStyles[type]}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description && <p className="text-sm mt-1">{description}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Tabs 组件
 */
interface TabsProps {
  tabs: Array<{
    label: string;
    value: string;
  }>;
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ tabs, activeTab, onTabChange, children }: TabsProps) {
  return (
    <div>
      <div className="flex border-b border-gray-200 gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/**
 * Input 组件
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <input
        className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-300 focus:ring-red-200'
            : 'border-gray-300 focus:ring-blue-200'
        }`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

/**
 * Select 组件
 */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{
    label: string;
    value: string;
  }>;
}

export function Select({ label, error, options, ...props }: SelectProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <select
        className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-300 focus:ring-red-200'
            : 'border-gray-300 focus:ring-blue-200'
        }`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

/**
 * Skeleton 加载骨架屏
 */
interface SkeletonProps {
  width?: string;
  height?: string;
  count?: number;
}

export function Skeleton({ width = 'w-full', height = 'h-4', count = 1 }: SkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${width} ${height} bg-gray-200 rounded animate-pulse`}
        />
      ))}
    </div>
  );
}
