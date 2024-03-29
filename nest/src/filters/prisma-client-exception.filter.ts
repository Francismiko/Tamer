import type { ArgumentsHost } from "@nestjs/common";
import { Catch, HttpStatus, Logger } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { Response } from "express";

@Catch(PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
	catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost): void {
		const { code, meta, clientVersion, name, stack } = exception;
		const ctx = host.switchToHttp();
		const res = ctx.getResponse<Response>();
		const statusCode = this.getStatusCode(code);

		res.status(statusCode).json({
			type: name,
			code: code,
			meta: meta,
			version: clientVersion,
		});
		new Logger("PrismaClientKnownRequestError").error(`(${code})${stack}`);
	}

	private getStatusCode(code: string): HttpStatus {
		const exceptionCodes: Record<string, HttpStatus> = {
			P2000: HttpStatus.BAD_REQUEST,
			P2001: HttpStatus.NOT_FOUND,
			P2002: HttpStatus.CONFLICT,
			P2003: HttpStatus.INTERNAL_SERVER_ERROR,
			P2004: HttpStatus.INTERNAL_SERVER_ERROR,
			P2005: HttpStatus.BAD_REQUEST,
			P2006: HttpStatus.BAD_REQUEST,
			P2007: HttpStatus.BAD_REQUEST,
			P2008: HttpStatus.BAD_REQUEST,
			P2009: HttpStatus.BAD_REQUEST,
			P2010: HttpStatus.INTERNAL_SERVER_ERROR,
			P2011: HttpStatus.BAD_REQUEST,
			P2012: HttpStatus.BAD_REQUEST,
			P2013: HttpStatus.BAD_REQUEST,
			P2014: HttpStatus.BAD_REQUEST,
			P2015: HttpStatus.NOT_FOUND,
			P2016: HttpStatus.BAD_REQUEST,
			P2017: HttpStatus.BAD_REQUEST,
			P2018: HttpStatus.BAD_REQUEST,
			P2019: HttpStatus.BAD_REQUEST,
			P2020: HttpStatus.BAD_REQUEST,
			P2021: HttpStatus.NOT_FOUND,
			P2022: HttpStatus.NOT_FOUND,
			P2023: HttpStatus.NOT_FOUND,
			P2024: HttpStatus.REQUEST_TIMEOUT,
			P2025: HttpStatus.BAD_REQUEST,
			P2026: HttpStatus.NOT_IMPLEMENTED,
			P2027: HttpStatus.INTERNAL_SERVER_ERROR,
			P2028: HttpStatus.INTERNAL_SERVER_ERROR,
			P2030: HttpStatus.BAD_REQUEST,
			P2031: HttpStatus.NOT_IMPLEMENTED,
			P2033: HttpStatus.BAD_REQUEST,
			P2034: HttpStatus.INTERNAL_SERVER_ERROR,
		};

		return exceptionCodes[code] || HttpStatus.INTERNAL_SERVER_ERROR;
	}
}
