//  Audit log utility — logs admin and critical actions for accountability.


import { logger } from "./logger.js";

/**
 * Log an audit event for admin/critical actions
 * @param {object} params
 * @param {string} params.action - What happened (e.g., "USER_CREATED", "ROLE_UPDATED")
 * @param {string} params.actorId - Who performed the action
 * @param {string} params.targetId - Who/what was affected (optional)
 * @param {object} params.details - Additional context (optional)
 */
export const auditLog = ({ action, actorId, targetId = null, details = {} }) => {
  logger.info(`AUDIT: ${action}`, {
    action,
    actorId,
    targetId,
    details,
    timestamp: new Date().toISOString()
  });
};
