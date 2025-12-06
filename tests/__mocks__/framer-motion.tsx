/**
 * 🧪 MOCKS - Framer Motion
 * Mock pour éviter les erreurs de Framer Motion dans les tests
 */

import { vi } from 'vitest'

const mockMotion = {
  div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  input: ({ children, ...props }: any) => <input {...props}>{children}</input>,
  form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
  aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
  header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  footer: ({ children, ...props }: any) => <footer {...props}>{children}</footer>,
  nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
  main: ({ children, ...props }: any) => <main {...props}>{children}</main>,
  a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
  ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
  h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  p: ({ children, ...props }: any) => <p {...props}>{children}</p>
}

export const motion = mockMotion

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => children

export const useAnimation = () => ({
  start: vi.fn(),
  stop: vi.fn(),
  set: vi.fn()
})

export const useInView = () => ({
  ref: { current: null },
  inView: true,
  entry: null
})

export const useMotionValue = (initial: any) => ({
  get: () => initial,
  set: vi.fn(),
  on: vi.fn(),
  destroy: vi.fn()
})

export const useTransform = () => ({
  get: () => 0,
  set: vi.fn()
})

export const useSpring = () => ({
  get: () => 0,
  set: vi.fn()
})

export const useDragControls = () => ({
  start: vi.fn()
})

export default {
  motion,
  AnimatePresence,
  useAnimation,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
  useDragControls
}
