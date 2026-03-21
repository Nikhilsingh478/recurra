// Safe gtag wrapper
const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args);
  }
};

export const analytics = {

  // Fired when user clicks Generate Probables button
  // (after validation passes, right before API call starts)
  analysisStarted: () => {
    gtag('event', 'analysis_started', {
      event_category: 'engagement',
    });
  },

  // Fired when Gemini returns valid results successfully
  analysisCompleted: (subject: string, unitCount: number) => {
    gtag('event', 'analysis_completed', {
      event_category: 'engagement',
      subject_name: subject,
      unit_count: unitCount,
    });
  },

  // Fired when analysis fails for any reason
  analysisFailed: (reason: string) => {
    gtag('event', 'analysis_failed', {
      event_category: 'error',
      failure_reason: reason,
    });
  },

  // Fired when user clicks Export PDF
  pdfExported: () => {
    gtag('event', 'pdf_exported', {
      event_category: 'engagement',
    });
  },

  // Fired when user clicks Copy Results
  resultsCopied: () => {
    gtag('event', 'results_copied', {
      event_category: 'engagement',
    });
  },

  // Fired when user switches tabs on Results page
  tabSwitched: (tabName: string) => {
    gtag('event', 'tab_switched', {
      event_category: 'navigation',
      tab_name: tabName,
    });
  },

  // Fired when user submits feedback form
  feedbackSubmitted: (rating: number) => {
    gtag('event', 'feedback_submitted', {
      event_category: 'engagement',
      rating: rating,
    });
  },
};
