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
    {
        id: 1,
        label: 'TOUR 1 OF 4 - WELCOME',
        title: 'Welcome to VulnWatch!',
        description: "We are thrilled to have you here! Let's take a quick tour to show you how easy it is to get full visibility into your security posture.",
        targetSelector: 'body',
        arrow: 'none',
        buttonLabel: 'continue',
    },
    {
        id: 2,
        label: 'TOUR 2 OF 4 - HOW IT WORKS',
        title: 'Three steps to full security visibility',
        description: 'First verify you own the domain, then we run a passive non-intrusive scan, and finally the AI turns the results into plain-English actions you can act on immediately.',
        targetSelector: '[data-tour="add-domain"]',
        arrow: 'top',
        buttonLabel: 'continue',
    },
    {
        id: 3,
        label: 'TOUR 3 OF 4 - NAVIGATION',
        title: 'Your five core sections',
        description: 'Dashboard gives you the overview. Domains manages your verified sites. Scans shows run history. Reports holds AI summaries. Settings controls your account and alerts.',
        targetSelector: '#tour-sidebar, #tour-mobile-menu',
        arrow: 'left',
        buttonLabel: 'continue',
    },
    {
        id: 4,
        label: 'TOUR 4 OF 4 - RESOURCES',
        title: 'Your docs and API keys live here',
        description: 'Security Docs walks you through every finding type and remediation guide. API Access gives you your key to integrate VulnWatch scan results into your own pipelines and tools.',
        targetSelector: '#tour-resources, #tour-mobile-settings',
        arrow: 'left',
        buttonLabel: 'done',
    },
]