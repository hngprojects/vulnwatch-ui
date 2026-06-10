export type ArrowDirection = 'left' | 'top' | 'bottom' | 'right' | 'none'

export interface TourStep {
    id: number
    label: string
    title: string
    description: string
    targetSelector: string
    arrow: ArrowDirection
    buttonLabel: 'continue' | 'done'
}

export const tourSteps: TourStep[] = [
    // step 1
    {
        id: 1,
        label: 'TOUR 1 OF 2 - WELCOME',
        title: 'Welcome to VulnWatch!',
        description: 'To get started on your security journey, you will need to add and verify your first domain. Click here whenever you are ready.',
        targetSelector: '#tour-add-domain',
        arrow: 'top',
        buttonLabel: 'continue',
    },
    // step 2
    {
        id: 2,
        label: 'TOUR 2 OF 2 - NAVIGATION',
        title: 'Your Command Center',
        description: 'Use the sidebar to navigate between your Dashboard overview, active Domains, previous Scan histories, and AI-generated Reports.',
        targetSelector: '#tour-sidebar',
        arrow: 'left',
        buttonLabel: 'done',
    },
]