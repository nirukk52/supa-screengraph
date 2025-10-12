"""
Unit tests for AppiumTools types.
"""

import pytest
from datetime import datetime
from src.adapters.appium.types import (
    ToolResult, ToolMetadata, ToolCategory, Bounds, DriverConfig,
    SelectorType, DeviceOrientation, SwipeDirection, ScrollDirection,
    SystemPermission, AppInfo, AppVersionInfo, DeepLinkInfo
)


class TestToolResult:
    """Tests for ToolResult dataclass."""
    
    def test_tool_result_success(self):
        """Test successful ToolResult creation."""
        result = ToolResult(success=True, data="test_data")
        assert result.success is True
        assert result.data == "test_data"
        assert result.error is None
        assert isinstance(result.timestamp, datetime)
    
    def test_tool_result_failure(self):
        """Test failure ToolResult creation."""
        result = ToolResult(success=False, error="test_error")
        assert result.success is False
        assert result.error == "test_error"
        assert result.data is None
    
    def test_tool_result_with_metadata(self):
        """Test ToolResult with metadata."""
        metadata = {"key": "value"}
        result = ToolResult(success=True, data="test", metadata=metadata)
        assert result.metadata == metadata


class TestToolMetadata:
    """Tests for ToolMetadata dataclass."""
    
    def test_tool_metadata_creation(self):
        """Test ToolMetadata creation."""
        metadata = ToolMetadata(
            name="test_tool",
            description="Test tool description",
            category=ToolCategory.CONNECTION,
            platform=["android"],
            requiresDriver=True,
            timeout=5000,
            retryable=True
        )
        assert metadata.name == "test_tool"
        assert metadata.category == ToolCategory.CONNECTION
        assert metadata.platform == ["android"]


class TestBounds:
    """Tests for Bounds dataclass."""
    
    def test_bounds_creation(self):
        """Test Bounds creation."""
        bounds = Bounds(x=100, y=200, width=50, height=75)
        assert bounds.x == 100
        assert bounds.y == 200
        assert bounds.width == 50
        assert bounds.height == 75
    
    def test_bounds_center(self):
        """Test Bounds center calculation."""
        bounds = Bounds(x=100, y=200, width=50, height=100)
        center = bounds.center()
        assert center == (125, 250)
    
    def test_bounds_to_dict(self):
        """Test Bounds to dictionary conversion."""
        bounds = Bounds(x=10, y=20, width=30, height=40)
        bounds_dict = bounds.to_dict()
        assert bounds_dict == {"x": 10, "y": 20, "width": 30, "height": 40}


class TestDriverConfig:
    """Tests for DriverConfig dataclass."""
    
    def test_android_driver_config(self):
        """Test Android DriverConfig creation."""
        config = DriverConfig(
            platform_name="android",
            device_name="emulator-5554",
            platform_version="11.0",
            app_package="com.example.app",
            automation_name="UiAutomator2"
        )
        assert config.platform_name == "android"
        assert config.app_package == "com.example.app"
        assert config.automation_name == "UiAutomator2"
    
    def test_ios_driver_config(self):
        """Test iOS DriverConfig creation."""
        config = DriverConfig(
            platform_name="ios",
            device_name="iPhone 14",
            platform_version="16.0",
            bundle_id="com.example.app",
            automation_name="XCUITest"
        )
        assert config.platform_name == "ios"
        assert config.bundle_id == "com.example.app"
        assert config.automation_name == "XCUITest"


class TestEnums:
    """Tests for enum types."""
    
    def test_selector_type_enum(self):
        """Test SelectorType enum."""
        assert SelectorType.ID.value == "id"
        assert SelectorType.XPATH.value == "xpath"
        assert SelectorType.ACCESSIBILITY_ID.value == "accessibility_id"
    
    def test_device_orientation_enum(self):
        """Test DeviceOrientation enum."""
        assert DeviceOrientation.PORTRAIT.value == "portrait"
        assert DeviceOrientation.LANDSCAPE.value == "landscape"
    
    def test_swipe_direction_enum(self):
        """Test SwipeDirection enum."""
        assert SwipeDirection.UP.value == "up"
        assert SwipeDirection.DOWN.value == "down"
        assert SwipeDirection.LEFT.value == "left"
        assert SwipeDirection.RIGHT.value == "right"
    
    def test_system_permission_enum(self):
        """Test SystemPermission enum."""
        assert SystemPermission.CAMERA.value == "camera"
        assert SystemPermission.LOCATION.value == "location"
        assert SystemPermission.MICROPHONE.value == "microphone"


class TestAppInfo:
    """Tests for AppInfo dataclass."""
    
    def test_app_info_creation(self):
        """Test AppInfo creation."""
        version_info = AppVersionInfo(
            version_name="1.0.0",
            version_code="1",
            package_name="com.example.app"
        )
        app_info = AppInfo(
            package_name="com.example.app",
            app_name="Example App",
            version_info=version_info,
            is_installed=True,
            is_running=False
        )
        assert app_info.package_name == "com.example.app"
        assert app_info.app_name == "Example App"
        assert app_info.version_info.version_name == "1.0.0"
        assert app_info.is_installed is True


class TestDeepLinkInfo:
    """Tests for DeepLinkInfo dataclass."""
    
    def test_deep_link_valid(self):
        """Test valid DeepLinkInfo creation."""
        deep_link = DeepLinkInfo(
            scheme="myapp",
            host="example.com",
            path="/screen",
            query_params={"id": "123"},
            full_url="myapp://example.com/screen?id=123",
            is_valid=True
        )
        assert deep_link.scheme == "myapp"
        assert deep_link.host == "example.com"
        assert deep_link.path == "/screen"
        assert deep_link.is_valid is True
    
    def test_deep_link_invalid(self):
        """Test invalid DeepLinkInfo creation."""
        deep_link = DeepLinkInfo(
            scheme="",
            full_url="invalid_url",
            is_valid=False,
            error_message="Invalid URL format"
        )
        assert deep_link.is_valid is False
        assert deep_link.error_message == "Invalid URL format"

