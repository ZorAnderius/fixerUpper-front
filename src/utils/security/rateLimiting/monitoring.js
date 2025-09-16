/**
 * Security Monitoring System
 * Real-time monitoring and alerting for security events
 */

class SecurityMonitor {
  constructor(options = {}) {
    this.config = {
      enableRealTimeMonitoring: options.enableRealTimeMonitoring !== false,
      enableAlerting: options.enableAlerting !== false,
      alertThresholds: {
        highRiskScore: options.alertThresholds?.highRiskScore || 0.8,
        rapidRequests: options.alertThresholds?.rapidRequests || 100,
        suspiciousIPs: options.alertThresholds?.suspiciousIPs || 10,
        ...options.alertThresholds
      },
      retentionPeriod: options.retentionPeriod || 7 * 24 * 60 * 60 * 1000, // 7 days
      ...options
    };

    // Storage for security events
    this.securityEvents = [];
    this.alerts = [];
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      suspiciousRequests: 0,
      botDetections: 0,
      bruteForceAttempts: 0,
      startTime: Date.now()
    };

    // Initialize monitoring
    this.initializeMonitoring();
  }

  /**
   * Log security event
   * @param {Object} event - Security event data
   */
  logSecurityEvent(event) {
    const securityEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: event.type || 'unknown',
      severity: event.severity || 'medium',
      source: event.source || 'unknown',
      identifier: event.identifier || 'unknown',
      details: event.details || {},
      riskScore: event.riskScore || 0,
      ...event
    };

    // Add to events storage
    this.securityEvents.push(securityEvent);

    // Update metrics
    this.updateMetrics(securityEvent);

    // Check for alerts
    this.checkAlerts(securityEvent);

    // Clean old events
    this.cleanOldEvents();

    // Real-time monitoring
    if (this.config.enableRealTimeMonitoring) {
      this.processRealTimeEvent(securityEvent);
    }

    return securityEvent.id;
  }

  /**
   * Log authentication attempt
   * @param {string} identifier - IP address or user ID
   * @param {Object} attemptData - Attempt data
   */
  logAuthAttempt(identifier, attemptData) {
    const event = {
      type: 'authentication_attempt',
      identifier,
      source: 'auth',
      severity: attemptData.success ? 'low' : 'medium',
      details: {
        username: attemptData.username,
        success: attemptData.success,
        endpoint: attemptData.endpoint,
        userAgent: attemptData.userAgent,
        timestamp: Date.now()
      },
      riskScore: attemptData.success ? 0 : 0.3
    };

    return this.logSecurityEvent(event);
  }

  /**
   * Log brute force attempt
   * @param {string} identifier - IP address
   * @param {Object} attemptData - Attempt data
   */
  logBruteForceAttempt(identifier, attemptData) {
    const event = {
      type: 'brute_force_attempt',
      identifier,
      source: 'brute_force_protection',
      severity: 'high',
      details: {
        username: attemptData.username,
        attempts: attemptData.attempts,
        timeWindow: attemptData.timeWindow,
        endpoint: attemptData.endpoint,
        blocked: attemptData.blocked
      },
      riskScore: 0.8
    };

    return this.logSecurityEvent(event);
  }

  /**
   * Log bot detection
   * @param {string} identifier - IP address
   * @param {Object} detectionData - Detection data
   */
  logBotDetection(identifier, detectionData) {
    const event = {
      type: 'bot_detection',
      identifier,
      source: 'bot_detection',
      severity: detectionData.confidence > 0.8 ? 'high' : 'medium',
      details: {
        suspicionScore: detectionData.suspicionScore,
        confidence: detectionData.confidence,
        reasons: detectionData.reasons,
        userAgent: detectionData.userAgent,
        blocked: detectionData.blocked
      },
      riskScore: detectionData.suspicionScore
    };

    return this.logSecurityEvent(event);
  }

  /**
   * Log rate limit violation
   * @param {string} identifier - IP address
   * @param {Object} violationData - Violation data
   */
  logRateLimitViolation(identifier, violationData) {
    const event = {
      type: 'rate_limit_violation',
      identifier,
      source: 'rate_limiter',
      severity: 'medium',
      details: {
        endpoint: violationData.endpoint,
        requests: violationData.requests,
        limit: violationData.limit,
        window: violationData.window,
        blocked: violationData.blocked
      },
      riskScore: 0.6
    };

    return this.logSecurityEvent(event);
  }

  /**
   * Log suspicious activity
   * @param {string} identifier - IP address
   * @param {Object} activityData - Activity data
   */
  logSuspiciousActivity(identifier, activityData) {
    const event = {
      type: 'suspicious_activity',
      identifier,
      source: activityData.source || 'monitoring',
      severity: activityData.severity || 'medium',
      details: {
        pattern: activityData.pattern,
        description: activityData.description,
        userAgent: activityData.userAgent,
        endpoint: activityData.endpoint,
        timestamp: Date.now()
      },
      riskScore: activityData.riskScore || 0.5
    };

    return this.logSecurityEvent(event);
  }

  /**
   * Get security dashboard data
   * @param {Object} options - Dashboard options
   * @returns {Object} - Dashboard data
   */
  getDashboardData(options = {}) {
    const {
      timeRange = 24 * 60 * 60 * 1000, // 24 hours
      groupBy = 'hour'
    } = options;

    const now = Date.now();
    const startTime = now - timeRange;

    // Filter events by time range
    const recentEvents = this.securityEvents.filter(event => 
      event.timestamp >= startTime
    );

    // Group events by time period
    const groupedEvents = this.groupEventsByTime(recentEvents, groupBy);

    // Calculate statistics
    const stats = this.calculateStatistics(recentEvents);

    // Get top threats
    const topThreats = this.getTopThreats(recentEvents);

    // Get recent alerts
    const recentAlerts = this.getRecentAlerts(timeRange);

    return {
      timeRange,
      period: groupBy,
      statistics: stats,
      events: groupedEvents,
      topThreats,
      alerts: recentAlerts,
      uptime: now - this.metrics.startTime,
      lastUpdate: now
    };
  }

  /**
   * Get security metrics
   * @param {Object} options - Metrics options
   * @returns {Object} - Security metrics
   */
  getSecurityMetrics(options = {}) {
    const {
      timeRange = 60 * 60 * 1000 // 1 hour
    } = options;

    const now = Date.now();
    const startTime = now - timeRange;

    const recentEvents = this.securityEvents.filter(event => 
      event.timestamp >= startTime
    );

    const metrics = {
      totalRequests: this.metrics.totalRequests,
      blockedRequests: this.metrics.blockedRequests,
      suspiciousRequests: this.metrics.suspiciousRequests,
      botDetections: this.metrics.botDetections,
      bruteForceAttempts: this.metrics.bruteForceAttempts,
      
      // Recent activity
      recentEvents: recentEvents.length,
      highSeverityEvents: recentEvents.filter(e => e.severity === 'high').length,
      mediumSeverityEvents: recentEvents.filter(e => e.severity === 'medium').length,
      lowSeverityEvents: recentEvents.filter(e => e.severity === 'low').length,
      
      // Event types
      eventTypes: this.getEventTypeDistribution(recentEvents),
      
      // Top IPs
      topIPs: this.getTopIPs(recentEvents),
      
      // Risk score distribution
      riskDistribution: this.getRiskDistribution(recentEvents),
      
      // Uptime
      uptime: now - this.metrics.startTime,
      lastUpdate: now
    };

    return metrics;
  }

  /**
   * Generate security report
   * @param {Object} options - Report options
   * @returns {Object} - Security report
   */
  generateSecurityReport(options = {}) {
    const {
      timeRange = 24 * 60 * 60 * 1000, // 24 hours
      includeRecommendations = true
    } = options;

    const now = Date.now();
    const startTime = now - timeRange;

    const recentEvents = this.securityEvents.filter(event => 
      event.timestamp >= startTime
    );

    const report = {
      reportId: this.generateReportId(),
      generatedAt: now,
      timeRange,
      summary: this.generateReportSummary(recentEvents),
      statistics: this.calculateStatistics(recentEvents),
      topThreats: this.getTopThreats(recentEvents),
      eventDistribution: this.getEventTypeDistribution(recentEvents),
      riskAnalysis: this.analyzeRiskTrends(recentEvents),
      recommendations: includeRecommendations ? this.generateRecommendations(recentEvents) : [],
      detailedEvents: recentEvents.slice(-100) // Last 100 events
    };

    return report;
  }

  /**
   * Check for security alerts
   * @param {Object} event - Security event
   */
  checkAlerts(event) {
    if (!this.config.enableAlerting) return;

    const alerts = [];

    // High risk score alert
    if (event.riskScore >= this.config.alertThresholds.highRiskScore) {
      alerts.push({
        type: 'high_risk_score',
        severity: 'high',
        message: `High risk activity detected: ${event.type}`,
        details: event
      });
    }

    // Rapid requests alert
    const recentRequests = this.getRecentRequests(5 * 60 * 1000); // Last 5 minutes
    if (recentRequests.length >= this.config.alertThresholds.rapidRequests) {
      alerts.push({
        type: 'rapid_requests',
        severity: 'medium',
        message: `Rapid request pattern detected: ${recentRequests.length} requests`,
        details: { count: recentRequests.length, timeWindow: '5 minutes' }
      });
    }

    // Multiple suspicious IPs alert
    const suspiciousIPs = this.getSuspiciousIPs(60 * 60 * 1000); // Last hour
    if (suspiciousIPs.length >= this.config.alertThresholds.suspiciousIPs) {
      alerts.push({
        type: 'multiple_suspicious_ips',
        severity: 'medium',
        message: `Multiple suspicious IPs detected: ${suspiciousIPs.length} IPs`,
        details: { ips: suspiciousIPs }
      });
    }

    // Process alerts
    alerts.forEach(alert => this.processAlert(alert));
  }

  /**
   * Process security alert
   * @param {Object} alert - Alert data
   */
  processAlert(alert) {
    const securityAlert = {
      id: this.generateAlertId(),
      timestamp: Date.now(),
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      details: alert.details,
      acknowledged: false,
      resolved: false
    };

    this.alerts.push(securityAlert);

    // Log alert
    console.warn('Security Alert:', securityAlert);

    // In a real application, this would:
    // - Send email/SMS notifications
    // - Update dashboard
    // - Trigger automated responses
    // - Log to external monitoring systems
  }

  // Helper methods
  updateMetrics(event) {
    this.metrics.totalRequests++;

    if (event.type === 'rate_limit_violation' || event.type === 'brute_force_attempt') {
      this.metrics.blockedRequests++;
    }

    if (event.severity === 'medium' || event.severity === 'high') {
      this.metrics.suspiciousRequests++;
    }

    if (event.type === 'bot_detection') {
      this.metrics.botDetections++;
    }

    if (event.type === 'brute_force_attempt') {
      this.metrics.bruteForceAttempts++;
    }
  }

  cleanOldEvents() {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    this.securityEvents = this.securityEvents.filter(event => 
      event.timestamp > cutoffTime
    );
  }

  groupEventsByTime(events, groupBy) {
    const groups = new Map();
    const interval = this.getTimeInterval(groupBy);

    events.forEach(event => {
      const groupTime = Math.floor(event.timestamp / interval) * interval;
      if (!groups.has(groupTime)) {
        groups.set(groupTime, []);
      }
      groups.get(groupTime).push(event);
    });

    return Array.from(groups.entries()).map(([time, events]) => ({
      time,
      count: events.length,
      events: events.slice(0, 10) // Limit to 10 events per group
    }));
  }

  getTimeInterval(groupBy) {
    switch (groupBy) {
      case 'minute': return 60 * 1000;
      case 'hour': return 60 * 60 * 1000;
      case 'day': return 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  }

  calculateStatistics(events) {
    const stats = {
      total: events.length,
      bySeverity: {
        high: events.filter(e => e.severity === 'high').length,
        medium: events.filter(e => e.severity === 'medium').length,
        low: events.filter(e => e.severity === 'low').length
      },
      byType: this.getEventTypeDistribution(events),
      averageRiskScore: events.reduce((sum, e) => sum + e.riskScore, 0) / events.length || 0,
      uniqueIPs: new Set(events.map(e => e.identifier)).size
    };

    return stats;
  }

  getTopThreats(events, limit = 10) {
    const threatCounts = new Map();
    
    events.forEach(event => {
      const key = `${event.type}:${event.identifier}`;
      const current = threatCounts.get(key) || { count: 0, severity: event.severity, riskScore: 0 };
      current.count++;
      current.riskScore = Math.max(current.riskScore, event.riskScore);
      threatCounts.set(key, current);
    });

    return Array.from(threatCounts.entries())
      .map(([key, data]) => ({
        key,
        count: data.count,
        severity: data.severity,
        riskScore: data.riskScore
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getEventTypeDistribution(events) {
    const distribution = new Map();
    
    events.forEach(event => {
      const current = distribution.get(event.type) || 0;
      distribution.set(event.type, current + 1);
    });

    return Object.fromEntries(distribution);
  }

  getTopIPs(events, limit = 10) {
    const ipCounts = new Map();
    
    events.forEach(event => {
      const current = ipCounts.get(event.identifier) || 0;
      ipCounts.set(event.identifier, current + 1);
    });

    return Array.from(ipCounts.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getRiskDistribution(events) {
    const distribution = {
      low: events.filter(e => e.riskScore < 0.3).length,
      medium: events.filter(e => e.riskScore >= 0.3 && e.riskScore < 0.7).length,
      high: events.filter(e => e.riskScore >= 0.7).length
    };

    return distribution;
  }

  getRecentRequests(timeWindow) {
    const cutoffTime = Date.now() - timeWindow;
    return this.securityEvents.filter(event => 
      event.timestamp > cutoffTime && 
      (event.type === 'rate_limit_violation' || event.type === 'authentication_attempt')
    );
  }

  getSuspiciousIPs(timeWindow) {
    const cutoffTime = Date.now() - timeWindow;
    const recentEvents = this.securityEvents.filter(event => 
      event.timestamp > cutoffTime && event.riskScore > 0.5
    );

    return [...new Set(recentEvents.map(event => event.identifier))];
  }

  getRecentAlerts(timeRange) {
    const cutoffTime = Date.now() - timeRange;
    return this.alerts.filter(alert => alert.timestamp > cutoffTime);
  }

  generateReportSummary(events) {
    const totalEvents = events.length;
    const highSeverity = events.filter(e => e.severity === 'high').length;
    const blockedRequests = events.filter(e => e.type === 'rate_limit_violation').length;
    
    return {
      totalEvents,
      highSeverityEvents: highSeverity,
      blockedRequests,
      securityScore: Math.max(0, 100 - (highSeverity * 10 + blockedRequests * 5)),
      riskLevel: highSeverity > 10 ? 'high' : highSeverity > 5 ? 'medium' : 'low'
    };
  }

  analyzeRiskTrends(events) {
    // Simple trend analysis
    const sortedEvents = events.sort((a, b) => a.timestamp - b.timestamp);
    const firstHalf = sortedEvents.slice(0, Math.floor(sortedEvents.length / 2));
    const secondHalf = sortedEvents.slice(Math.floor(sortedEvents.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, e) => sum + e.riskScore, 0) / firstHalf.length || 0;
    const secondHalfAvg = secondHalf.reduce((sum, e) => sum + e.riskScore, 0) / secondHalf.length || 0;

    return {
      trend: secondHalfAvg > firstHalfAvg ? 'increasing' : 'decreasing',
      change: Math.abs(secondHalfAvg - firstHalfAvg),
      firstHalfAverage: firstHalfAvg,
      secondHalfAverage: secondHalfAvg
    };
  }

  generateRecommendations(events) {
    const recommendations = [];
    
    const highRiskEvents = events.filter(e => e.riskScore > 0.7);
    if (highRiskEvents.length > 5) {
      recommendations.push('Consider implementing stricter rate limiting');
    }

    const botEvents = events.filter(e => e.type === 'bot_detection');
    if (botEvents.length > 10) {
      recommendations.push('Enhance bot detection capabilities');
    }

    const bruteForceEvents = events.filter(e => e.type === 'brute_force_attempt');
    if (bruteForceEvents.length > 3) {
      recommendations.push('Implement stronger authentication measures');
    }

    recommendations.push('Regularly review and update security policies');
    recommendations.push('Monitor for new attack patterns');

    return recommendations;
  }

  processRealTimeEvent(event) {
    // Real-time processing logic
    // This could include:
    // - Live dashboard updates
    // - Real-time notifications
    // - Automatic response triggers
    console.log('Real-time event:', event.type, event.severity);
  }

  generateEventId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateAlertId() {
    return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateReportId() {
    return 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  initializeMonitoring() {
    // Initialize monitoring systems
    // This could include:
    // - Setting up event listeners
    // - Starting background processes
    // - Connecting to external monitoring services
    console.log('Security monitoring initialized');
  }
}

export { SecurityMonitor };
