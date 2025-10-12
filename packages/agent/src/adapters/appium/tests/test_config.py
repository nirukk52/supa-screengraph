"""
Unit tests for AppiumTools configuration.
"""

import pytest
from src.adapters.appium.config import (
    APPIUM_DEFAULT_SERVER_URL,
    PLATFORM_ANDROID,
    PLATFORM_IOS,
    SUPPORTED_PLATFORMS,
    ANDROID_DEFAULT_AUTOMATION_NAME,
    IOS_DEFAULT_AUTOMATION_NAME,
    DEFAULT_IMPLICIT_WAIT,
    DEFAULT_COMMAND_TIMEOUT,
    ERROR_DRIVER_NOT_INITIALIZED,
    SUCCESS_CONNECTED,
    APPIUM_TOOLS_VERSION
)


class TestServerConfiguration:
    """Tests for server configuration constants."""
    
    def test_default_server_url(self):
        """Test default server URL."""
        assert APPIUM_DEFAULT_SERVER_URL == "http://localhost:4723"
    
    def test_server_url_format(self):
        """Test server URL format."""
        assert APPIUM_DEFAULT_SERVER_URL.startswith("http://")
        assert "4723" in APPIUM_DEFAULT_SERVER_URL


class TestPlatformConfiguration:
    """Tests for platform configuration constants."""
    
    def test_platform_constants(self):
        """Test platform constant values."""
        assert PLATFORM_ANDROID == "android"
        assert PLATFORM_IOS == "ios"
    
    def test_supported_platforms(self):
        """Test supported platforms list."""
        assert PLATFORM_ANDROID in SUPPORTED_PLATFORMS
        assert PLATFORM_IOS in SUPPORTED_PLATFORMS
        assert len(SUPPORTED_PLATFORMS) == 2


class TestAutomationConfiguration:
    """Tests for automation configuration constants."""
    
    def test_android_automation_name(self):
        """Test Android automation name."""
        assert ANDROID_DEFAULT_AUTOMATION_NAME == "UiAutomator2"
    
    def test_ios_automation_name(self):
        """Test iOS automation name."""
        assert IOS_DEFAULT_AUTOMATION_NAME == "XCUITest"


class TestTimeoutConfiguration:
    """Tests for timeout configuration constants."""
    
    def test_implicit_wait(self):
        """Test default implicit wait."""
        assert DEFAULT_IMPLICIT_WAIT == 10
        assert isinstance(DEFAULT_IMPLICIT_WAIT, int)
    
    def test_command_timeout(self):
        """Test default command timeout."""
        assert DEFAULT_COMMAND_TIMEOUT == 60
        assert isinstance(DEFAULT_COMMAND_TIMEOUT, int)
    
    def test_timeouts_positive(self):
        """Test that all timeouts are positive."""
        assert DEFAULT_IMPLICIT_WAIT > 0
        assert DEFAULT_COMMAND_TIMEOUT > 0


class TestErrorMessages:
    """Tests for error message constants."""
    
    def test_error_messages_not_empty(self):
        """Test that error messages are not empty."""
        assert ERROR_DRIVER_NOT_INITIALIZED != ""
        assert len(ERROR_DRIVER_NOT_INITIALIZED) > 0
    
    def test_error_message_format(self):
        """Test error message format."""
        assert "Driver not initialized" in ERROR_DRIVER_NOT_INITIALIZED


class TestSuccessMessages:
    """Tests for success message constants."""
    
    def test_success_messages_not_empty(self):
        """Test that success messages are not empty."""
        assert SUCCESS_CONNECTED != ""
        assert len(SUCCESS_CONNECTED) > 0
    
    def test_success_message_format(self):
        """Test success message format."""
        assert "connected" in SUCCESS_CONNECTED.lower()


class TestVersionConfiguration:
    """Tests for version configuration."""
    
    def test_version_format(self):
        """Test version format."""
        assert APPIUM_TOOLS_VERSION is not None
        assert len(APPIUM_TOOLS_VERSION.split('.')) >= 2
    
    def test_version_string(self):
        """Test version is a string."""
        assert isinstance(APPIUM_TOOLS_VERSION, str)

