/**
 * 🎭 MOCK - Framer Motion
 * Mock complet de Framer Motion pour les tests
 */

import { vi } from 'vitest'

// Mock de motion avec toutes les props essentielles
const createMockMotionComponent = (Component: any) => {
  return vi.fn().mockImplementation(({ children, ...props }) => {
    // Simuler les animations en appelant les callbacks
    if (props.onAnimationStart) props.onAnimationStart()
    if (props.onAnimationComplete) props.onAnimationComplete()
    
    return React.createElement(Component, {
      ...props,
      // Supprimer les props spécifiques à Framer Motion
      animate: undefined,
      initial: undefined,
      exit: undefined,
      transition: undefined,
      variants: undefined,
      whileHover: undefined,
      whileTap: undefined,
      whileFocus: undefined,
      whileInView: undefined,
      onAnimationStart: undefined,
      onAnimationComplete: undefined,
      onUpdate: undefined,
      onDragStart: undefined,
      onDragEnd: undefined,
      layoutId: undefined,
      layout: undefined
    }, children)
  })
}

// Mock des composants motion
export const motion = {
  div: createMockMotionComponent('div'),
  span: createMockMotionComponent('span'),
  p: createMockMotionComponent('p'),
  button: createMockMotionComponent('button'),
  form: createMockMotionComponent('form'),
  input: createMockMotionComponent('input'),
  textarea: createMockMotionComponent('textarea'),
  select: createMockMotionComponent('select'),
  ul: createMockMotionComponent('ul'),
  li: createMockMotionComponent('li'),
  nav: createMockMotionComponent('nav'),
  header: createMockMotionComponent('header'),
  main: createMockMotionComponent('main'),
  section: createMockMotionComponent('section'),
  article: createMockMotionComponent('article'),
  aside: createMockMotionComponent('aside'),
  footer: createMockMotionComponent('footer'),
  h1: createMockMotionComponent('h1'),
  h2: createMockMotionComponent('h2'),
  h3: createMockMotionComponent('h3'),
  h4: createMockMotionComponent('h4'),
  h5: createMockMotionComponent('h5'),
  h6: createMockMotionComponent('h6'),
  img: createMockMotionComponent('img'),
  a: createMockMotionComponent('a'),
  svg: createMockMotionComponent('svg'),
  path: createMockMotionComponent('path'),
  circle: createMockMotionComponent('circle'),
  rect: createMockMotionComponent('rect')
}

// Mock d'AnimatePresence
export const AnimatePresence = vi.fn().mockImplementation(({ children }) => children)

// Mock des hooks
export const useAnimation = vi.fn().mockReturnValue({
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
  set: vi.fn()
})

export const useMotionValue = vi.fn().mockImplementation((initial) => ({
  get: vi.fn().mockReturnValue(initial),
  set: vi.fn(),
  getVelocity: vi.fn().mockReturnValue(0),
  onChange: vi.fn(),
  destroy: vi.fn()
}))

export const useTransform = vi.fn().mockImplementation((value, inputRange, outputRange) => ({
  get: vi.fn().mockReturnValue(outputRange[0]),
  set: vi.fn(),
  onChange: vi.fn()
}))

export const useSpring = vi.fn().mockReturnValue({
  get: vi.fn().mockReturnValue(0),
  set: vi.fn(),
  onChange: vi.fn()
})

export const useScroll = vi.fn().mockReturnValue({
  scrollX: { get: vi.fn().mockReturnValue(0) },
  scrollY: { get: vi.fn().mockReturnValue(0) },
  scrollXProgress: { get: vi.fn().mockReturnValue(0) },
  scrollYProgress: { get: vi.fn().mockReturnValue(0) }
})

export const useInView = vi.fn().mockReturnValue(true)

export const useDragControls = vi.fn().mockReturnValue({
  start: vi.fn(),
  stop: vi.fn()
})

// Mock des utilitaires
export const stagger = vi.fn().mockImplementation((delay, options) => delay)

export const animate = vi.fn().mockResolvedValue(undefined)

export const animateValue = vi.fn()

// Mock des types (pour TypeScript)
export interface MotionProps {
  animate?: any
  initial?: any
  exit?: any
  transition?: any
  variants?: any
  whileHover?: any
  whileTap?: any
  whileFocus?: any
  whileInView?: any
  onAnimationStart?: () => void
  onAnimationComplete?: () => void
  onUpdate?: (latest: any) => void
  layoutId?: string
  layout?: boolean | string
  drag?: boolean | 'x' | 'y'
  dragConstraints?: any
  onDragStart?: () => void
  onDragEnd?: () => void
}

// Export par défaut pour la compatibilité
export default {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
  useSpring,
  useScroll,
  useInView,
  useDragControls,
  stagger,
  animate,
  animateValue
}
