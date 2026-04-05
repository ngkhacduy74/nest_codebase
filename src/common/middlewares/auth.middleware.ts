import { Injectable, NestMiddleware, LoggerService as NestLoggerService } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppLoggerService } from '@/common/services/logger.service';
import { AppError } from '@/common/errors/app.error';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    sessionId?: string;
    lastLoginAt?: Date;
  };
  sessionId?: string;
  requestId?: string;
  traceId?: string;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger: AppLoggerService;
  private readonly jwtService: JwtService;
  private readonly excludedPaths: string[];

  constructor(
    private readonly configService: ConfigService,
    logger: NestLoggerService,
    jwtService: JwtService,
  ) {
    this.logger = logger as AppLoggerService;
    this.jwtService = jwtService;
    
    // Paths that don't require authentication
    this.excludedPaths = [
      '/health',
      '/metrics',
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/docs',
      '/swagger',
    ];
  }

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Add correlation IDs
      this.addCorrelationIds(req);
      
      // Skip authentication for excluded paths
      if (this.isExcludedPath(req.path)) {
        this.logger.http(`Skipping authentication for excluded path: ${req.path}`, {
          requestId: req.requestId,
          traceId: req.traceId,
          path: req.path,
          method: req.method,
        });
        
        req.user = undefined;
        return next();
      }

      // Extract token from headers
      const token = this.extractToken(req);
      
      if (!token) {
        this.logger.security('No authentication token provided', {
          requestId: req.requestId,
          traceId: req.traceId,
          path: req.path,
          method: req.method,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        });
        
        req.user = undefined;
        return next();
      }

      // Validate token
      const payload = await this.validateToken(token);
      
      if (!payload) {
        this.logger.security('Invalid authentication token', {
          requestId: req.requestId,
          traceId: req.traceId,
          path: req.path,
          method: req.method,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          token: token.substring(0, 20) + '...', // Don't log full token
        });
        
        req.user = undefined;
        return next();
      }

      // Check if user is active
      if (!payload.isActive) {
        this.logger.security('Inactive user attempted access', {
          requestId: req.requestId,
          traceId: req.traceId,
          path: req.path,
          method: req.method,
          ip: req.ip,
          userId: payload.id,
          email: payload.email,
        });
        
        req.user = undefined;
        return next();
      }

      // Attach user to request
      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        sessionId: payload.sessionId,
        lastLoginAt: payload.lastLoginAt,
      };

      // Log successful authentication
      const duration = Date.now() - startTime;
      this.logger.auth(`User authenticated successfully`, {
        requestId: req.requestId,
        traceId: req.traceId,
        userId: payload.id,
        email: payload.email,
        role: payload.role,
        duration,
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      // Add security headers
      this.addSecurityHeaders(res);

      next();
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.errorWithException(
        'Authentication middleware error',
        error as Error,
        undefined,
        {
          requestId: req.requestId,
          traceId: req.traceId,
          path: req.path,
          method: req.method,
          duration,
          ip: req.ip,
        }
      );

      req.user = undefined;
      next();
    }
  }

  private addCorrelationIds(req: AuthenticatedRequest): void {
    // Extract or generate request ID
    req.requestId = req.headers['x-request-id'] as string || 
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract or generate trace ID
    req.traceId = req.headers['x-trace-id'] as string || 
      `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isExcludedPath(path: string): boolean {
    return this.excludedPaths.some(excludedPath => 
      path.startsWith(excludedPath) || 
      path === excludedPath
    );
  }

  private extractToken(req: Request): string | null {
    // Try Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try cookie
    const cookies = req.headers.cookie;
    if (cookies && typeof cookies === 'string') {
      const tokenMatch = cookies.match(/auth-token=([^;]+)/);
      if (tokenMatch) {
        return tokenMatch[1];
      }
    }

    // Try query parameter (for development/testing)
    const tokenQuery = req.query.token as string;
    if (tokenQuery) {
      return tokenQuery;
    }

    return null;
  }

  private async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('auth.jwt.accessToken.secret'),
        algorithms: ['HS256'],
        clockTolerance: 30, // Allow 30 seconds clock skew
      });

      return payload;
    } catch (error) {
      this.logger.security('Token validation failed', {
        error: error.message,
        token: token.substring(0, 20) + '...', // Don't log full token
      });
      
      return null;
    }
  }

  private addSecurityHeaders(res: Response): void {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Add CORS headers if needed
    const corsOrigin = this.configService.get('app.corsOrigin');
    if (corsOrigin && corsOrigin !== '*') {
      res.setHeader('Access-Control-Allow-Origin', corsOrigin);
      res.setHeader('Vary', 'Origin');
    }
  }
}
