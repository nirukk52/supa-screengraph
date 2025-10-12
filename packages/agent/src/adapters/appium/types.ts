/**
 * AppiumTools Types and Interfaces
 *
 * This module defines the core types and interfaces for the AppiumTools system.
 * All tools are designed to work with LangGraph and provide a unified interface
 * for mobile app automation across Android and iOS platforms.
 */

// Core result type for all tool operations
export interface ToolResult<T> {
	success: boolean;
	data?: T;
	error?: string;
	timestamp: Date;
}

// Element selector types
export enum SelectorType {
	ID = "id",
	XPATH = "xpath",
	CLASS_NAME = "className",
	ACCESSIBILITY_ID = "accessibilityId",
	ANDROID_UIAUTOMATOR = "androidUIAutomator",
	IOS_PREDICATE = "iosPredicate",
	IOS_CLASS_CHAIN = "iosClassChain",
	CSS_SELECTOR = "cssSelector",
	TAG_NAME = "tagName",
	LINK_TEXT = "linkText",
	PARTIAL_LINK_TEXT = "partialLinkText",
	NAME = "name",
}

// Element bounds for positioning
export interface Bounds {
	x: number;
	y: number;
	width: number;
	height: number;
}

// Device orientation options
export enum DeviceOrientation {
	PORTRAIT = "portrait",
	LANDSCAPE_LEFT = "landscapeLeft",
	LANDSCAPE_RIGHT = "landscapeRight",
	PORTRAIT_UPSIDE_DOWN = "portraitUpsideDown",
}

// Platform information
export interface PlatformInfo {
	platform: "android" | "ios";
	version: string;
	deviceModel: string;
	deviceName: string;
	automationName: string;
}

// Screen size information
export interface ScreenSize {
	width: number;
	height: number;
}

// Context information for webview switching
export interface AutomationContext {
	name: string;
	type: "NATIVE_APP" | "WEBVIEW";
	webviewName?: string;
}

// Permission types for system dialogs
export enum SystemPermission {
	CAMERA = "camera",
	MICROPHONE = "microphone",
	LOCATION = "location",
	STORAGE = "storage",
	CONTACTS = "contacts",
	CALENDAR = "calendar",
	PHONE = "phone",
	SMS = "sms",
	NOTIFICATIONS = "notifications",
}

// App management information
export interface AppInfo {
	packageName: string;
	activityName?: string;
	bundleId?: string;
	version?: string;
	isInstalled: boolean;
}

// Deep link information
export interface DeepLinkInfo {
	url: string;
	scheme: string;
	host?: string;
	path?: string;
	queryParams?: Record<string, string>;
}

// Tool execution context
export interface ToolExecutionContext {
	runId: string;
	sessionId: string;
	platform: "android" | "ios";
	deviceId: string;
	timestamp: Date;
}

// Batch operation result
export interface BatchOperationResult {
	results: ToolResult<any>[];
	successCount: number;
	failureCount: number;
	totalDuration: number;
}

// Tool metadata for LangGraph integration
export interface ToolMetadata {
	name: string;
	description: string;
	category: ToolCategory;
	platform: ("android" | "ios")[];
	requiresDriver: boolean;
	timeout?: number;
	retryable: boolean;
}

// Tool categories for organization
export enum ToolCategory {
	CONNECTION = "connection",
	DATA_GATHERING = "data_gathering",
	ELEMENT_ACTIONS = "element_actions",
	DEVICE_MANAGEMENT = "device_management",
	APP_MANAGEMENT = "app_management",
	SYSTEM_INTERACTION = "system_interaction",
	NAVIGATION = "navigation",
	UTILITIES = "utilities",
}

// Error types for better error handling
export enum ToolErrorType {
	DRIVER_NOT_AVAILABLE = "driver_not_available",
	ELEMENT_NOT_FOUND = "element_not_found",
	TIMEOUT = "timeout",
	INVALID_SELECTOR = "invalid_selector",
	PLATFORM_NOT_SUPPORTED = "platform_not_supported",
	PERMISSION_DENIED = "permission_denied",
	NETWORK_ERROR = "network_error",
	UNKNOWN_ERROR = "unknown_error",
}

export interface ToolError {
	type: ToolErrorType;
	message: string;
	details?: any;
	stack?: string;
}
