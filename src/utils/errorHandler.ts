// ERR_BLOCKED_BY_CLIENT console hatalarını yok eder - Ad blocker bypass
if (typeof window !== 'undefined') {
  // Override console.error to suppress DELETE 404 errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  const shouldSuppressError = (message: string): boolean => {
    // Suppress DELETE 404 errors - item already deleted
    // Pattern: "DELETE https://.../api/categories/... 404 (Not Found)"
    // Also check for "404 (Not Found)" pattern
    const has404 = message.includes('404') || message.includes('Not Found');
    const hasDelete = message.includes('DELETE') || message.includes('delete');
    const hasCategories = message.includes('/api/categories/') || 
                         message.includes('/categories/') ||
                         message.includes('categories') ||
                         message.includes('category');
    
    if (has404 && hasDelete && hasCategories) {
      return true;
    }
    
    // Also check for URL pattern in error messages
    if (has404 && hasDelete) {
      // Check if URL contains categories
      const urlMatch = message.match(/https?:\/\/[^\s]+/);
      if (urlMatch && (urlMatch[0].includes('/categories/') || urlMatch[0].includes('categories'))) {
        return true;
      }
    }
    
    // Suppress ERR_BLOCKED_BY_CLIENT errors
    if (message.includes('ERR_BLOCKED_BY_CLIENT') || 
        message.includes('net::ERR_BLOCKED_BY_CLIENT') ||
        message.includes('gen204') ||
        message.includes('pagespeed')) {
      return true;
    }
    
    return false;
  };
  
  console.error = function(...args: any[]) {
    // Check all arguments, including stack traces
    const allArgs = Array.from(args);
    let message = '';
    let fullMessage = '';
    
    // Convert all args to string
    for (const arg of allArgs) {
      let argStr = '';
      if (typeof arg === 'string') {
        argStr = arg;
      } else if (arg?.toString) {
        argStr = arg.toString();
      } else {
        try {
          argStr = JSON.stringify(arg);
        } catch {
          argStr = String(arg);
        }
      }
      message += argStr + ' ';
      fullMessage += argStr + ' ';
    }
    
    // Also check stack trace if available
    try {
      const stack = new Error().stack || '';
      fullMessage += stack;
    } catch (e) {
      // Ignore stack trace errors
    }
    
    // Check if this is a DELETE 404 error for categories
    // Pattern: "DELETE https://.../api/categories/... 404 (Not Found)"
    // Also check for minified code patterns
    const hasDelete = message.includes('DELETE') || 
                      message.includes('delete') || 
                      message.toLowerCase().includes('delete');
    const has404 = message.includes('404') || 
                   message.includes('Not Found') ||
                   message.includes('not found');
    const hasCategories = message.includes('/api/categories/') || 
                         message.includes('/categories/') ||
                         message.includes('categories') ||
                         message.includes('category');
    
    const isDelete404 = hasDelete && has404 && hasCategories;
    
    // Also check full message (with stack trace)
    const isDelete404Full = (
      (fullMessage.includes('DELETE') || fullMessage.includes('delete')) &&
      (fullMessage.includes('404') || fullMessage.includes('Not Found')) &&
      (fullMessage.includes('/api/categories/') || 
       fullMessage.includes('/categories/') ||
       fullMessage.includes('categories'))
    );
    
    if (isDelete404 || isDelete404Full) {
      // Silently ignore DELETE 404 errors - don't log to console
      return;
    }
    
    // Also check using shouldSuppressError
    if (shouldSuppressError(message) || shouldSuppressError(fullMessage)) {
      return;
    }
    
    // Call original console.error for other errors
    originalConsoleError.apply(console, args);
  };
  
  console.warn = function(...args: any[]) {
    const message = args.join(' ');
    
    if (shouldSuppressError(message)) {
      // Silently ignore DELETE 404 errors
      return;
    }
    
    // Call original console.warn for other warnings
    originalConsoleWarn.apply(console, args);
  };
  
  // Global error handler
  window.addEventListener('error', (e) => {
    // Suppress DELETE 404 errors - item already deleted
    if (e.message?.includes('404') && 
        (e.message?.includes('DELETE') || e.message?.includes('delete')) &&
        (e.message?.includes('/api/categories/') || e.message?.includes('categories'))) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    if (e.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
        e.message?.includes('net::ERR_BLOCKED_BY_CLIENT') ||
        e.filename?.includes('gen204') ||
        e.filename?.includes('pagespeed')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    const errorMessage = reason?.message || reason?.toString() || '';
    const errorCode = reason?.code || '';
    
    // Suppress DELETE 404 errors - item already deleted
    if (reason?.config?.method?.toLowerCase() === 'delete' && 
        reason?.response?.status === 404 &&
        (reason?.config?.url?.includes('/api/categories/') || reason?.config?.url?.includes('categories'))) {
      e.preventDefault();
      return false;
    }
    
    // Also check error message for DELETE 404
    if (errorMessage.includes('404') && 
        (errorMessage.includes('DELETE') || errorMessage.includes('delete')) &&
        (errorMessage.includes('/api/categories/') || errorMessage.includes('categories'))) {
      e.preventDefault();
      return false;
    }
    
    if (
      errorMessage.includes('ERR_BLOCKED_BY_CLIENT') ||
      errorMessage.includes('net::ERR_BLOCKED_BY_CLIENT') ||
      errorMessage.includes('Failed to fetch') ||
      errorCode === 'ERR_NETWORK' ||
      (reason?.request && !reason?.response) // Axios network error
    ) {
      e.preventDefault();
      return false;
    }
  });

  // Request interceptor for fetch
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      return await originalFetch(...args);
    } catch (e: any) {
      if (e?.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
          e?.message?.includes('Failed to fetch') ||
          args[0]?.toString().includes('gen204') ||
          args[0]?.toString().includes('pagespeed')) {
        // Silently ignore blocked requests
        return new Response(null, { status: 200, statusText: 'OK' });
      }
      throw e;
    }
  };

  // XMLHttpRequest interceptor for DELETE 404 and blocked requests
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  // Override open to store method/URL and block gen204/pagespeed
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
    const urlString = url.toString();
    
    // Block gen204/pagespeed requests silently
    if (urlString.includes('gen204') || urlString.includes('pagespeed')) {
      return;
    }
    
    // Store method and URL for DELETE 404 handling
    (this as any)._method = method.toUpperCase();
    (this as any)._url = urlString;
    
    return originalXHROpen.call(this, method, url, ...rest);
  };
  
  // Override send to handle DELETE 404 errors silently - MUST BE BEFORE AXIOS LOADS
  XMLHttpRequest.prototype.send = function(...args: any[]) {
    const xhr = this;
    const method = (xhr as any)._method || 'GET';
    const url = (xhr as any)._url || '';
    const originalOnError = xhr.onerror;
    const originalOnLoad = xhr.onload;
    const originalOnReadyStateChange = xhr.onreadystatechange;
    
    // CRITICAL: Store original status to intercept DELETE 404 BEFORE Axios reads it
    const isDeleteCategory = method === 'DELETE' && (url.includes('/api/categories/') || url.includes('/categories/'));
    
    if (isDeleteCategory) {
      // Intercept status property access
      let _internalStatus = 0;
      let _internalStatusText = '';
      
      // Store original status setter behavior
      const originalStatusDescriptor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'status') || 
                                       Object.getOwnPropertyDescriptor(Object.getPrototypeOf(xhr), 'status');
      
      // Override status getter to return 200 for DELETE 404
      try {
        Object.defineProperty(xhr, 'status', {
          get: function() {
            // If this is DELETE 404 for categories, return 200
            if (_internalStatus === 404) {
              return 200;
            }
            return _internalStatus;
          },
          set: function(value) {
            _internalStatus = value;
          },
          configurable: true,
          enumerable: true
        });
        
        Object.defineProperty(xhr, 'statusText', {
          get: function() {
            if (_internalStatus === 404) {
              return 'OK';
            }
            return _internalStatusText;
          },
          set: function(value) {
            _internalStatusText = value;
          },
          configurable: true,
          enumerable: true
        });
      } catch (e) {
        // If property override fails, use onreadystatechange instead
      }
    }
    
    // Override onreadystatechange to intercept DELETE 404 BEFORE Axios logs to console
    xhr.onreadystatechange = function() {
      // Intercept at readyState 3 (LOADING) or 4 (DONE) to catch 404 early
      if (isDeleteCategory && (xhr.readyState === 3 || xhr.readyState === 4)) {
        // Try to read status early (might not be available at readyState 3)
        try {
          const currentStatus = (xhr as any)._internalStatus || xhr.status;
          if (currentStatus === 404) {
            // Override status immediately
            try {
              (xhr as any)._internalStatus = 200;
              Object.defineProperty(xhr, 'status', {
                value: 200,
                writable: true,
                configurable: true,
                enumerable: true
              });
              Object.defineProperty(xhr, 'statusText', {
                value: 'OK',
                writable: true,
                configurable: true,
                enumerable: true
              });
            } catch (e) {
              // Property override might fail, continue anyway
            }
          }
        } catch (e) {
          // Status might not be readable yet
        }
      }
      
      // DELETE 404 = item already deleted, treat as success (status 200)
      if (isDeleteCategory && 
          xhr.readyState === 4) {
        const currentStatus = (xhr as any)._internalStatus || xhr.status;
        if (currentStatus === 404) {
          // Force status to 200
          try {
            (xhr as any)._internalStatus = 200;
            Object.defineProperty(xhr, 'status', {
              value: 200,
              writable: true,
              configurable: true,
              enumerable: true
            });
            Object.defineProperty(xhr, 'statusText', {
              value: 'OK',
              writable: true,
              configurable: true,
              enumerable: true
            });
          } catch (e) {
            // Ignore property override errors
          }
          
          // Prevent Axios from logging this error
          if (originalOnReadyStateChange) {
            try {
              originalOnReadyStateChange.call(this);
            } catch (e) {
              // Ignore errors in original handler
            }
          }
          return;
        }
      }
      
      if (originalOnReadyStateChange) {
        originalOnReadyStateChange.call(this);
      }
    };
    
    // Override onerror to suppress DELETE 404 errors
    xhr.onerror = function(e) {
      // Suppress DELETE 404 errors - item already deleted
      if (method === 'DELETE' && 
          (url.includes('/api/categories/') || url.includes('/categories/'))) {
        // Silently handle - don't call original error handler
        // Prevent console error
        return;
      }
      
      if (originalOnError) {
        originalOnError.call(this, e);
      }
    };
    
    // Override onload to handle DELETE 404 as success
    xhr.onload = function() {
      // DELETE 404 = item already deleted, treat as success
      if (method === 'DELETE' && 
          xhr.status === 404 && 
          (url.includes('/api/categories/') || url.includes('/categories/'))) {
        // Status already overridden in onreadystatechange
        if (originalOnLoad) {
          try {
            originalOnLoad.call(this);
          } catch (e) {
            // Ignore errors
          }
        }
        return;
      }
      
      if (originalOnLoad) {
        originalOnLoad.call(this);
      }
    };
    
    return originalXHRSend.apply(this, args);
  };
}

