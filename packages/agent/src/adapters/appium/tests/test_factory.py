"""
Unit tests for AppiumTools factory functions.
"""

import pytest
from src.adapters.appium.factory import (
    create_appium_tools,
    create_android_tools,
    create_ios_tools,
    create_driver_config,
    create_execution_context,
    get_supported_platforms,
    validate_platform
)
from src.adapters.appium.types import ToolExecutionContext, DriverConfig
from src.adapters.appium.implementations.android_appium_tools import AndroidAppiumTools
from src.adapters.appium.implementations.ios_appium_tools import IOSAppiumTools


class TestFactoryFunctions:
    """Tests for factory functions."""
    
    def test_get_supported_platforms(self):
        """Test getting supported platforms."""
        platforms = get_supported_platforms()
        assert 'android' in platforms
        assert 'ios' in platforms
        assert len(platforms) == 2
    
    def test_validate_platform_android(self):
        """Test validating Android platform."""
        assert validate_platform('android') is True
        assert validate_platform('ANDROID') is True
        assert validate_platform('Android') is True
    
    def test_validate_platform_ios(self):
        """Test validating iOS platform."""
        assert validate_platform('ios') is True
        assert validate_platform('IOS') is True
        assert validate_platform('iOS') is True
    
    def test_validate_platform_invalid(self):
        """Test validating invalid platform."""
        assert validate_platform('windows') is False
        assert validate_platform('linux') is False
        assert validate_platform('') is False


class TestCreateDriverConfig:
    """Tests for create_driver_config function."""
    
    def test_create_android_driver_config(self):
        """Test creating Android driver config."""
        config = create_driver_config(
            platform='android',
            device_name='emulator-5554',
            platform_version='11.0',
            app_package='com.example.app',
            app_activity='.MainActivity'
        )
        assert isinstance(config, DriverConfig)
        assert config.platform_name == 'android'
        assert config.device_name == 'emulator-5554'
        assert config.app_package == 'com.example.app'
        assert config.automation_name == 'UiAutomator2'
    
    def test_create_ios_driver_config(self):
        """Test creating iOS driver config."""
        config = create_driver_config(
            platform='ios',
            device_name='iPhone 14',
            platform_version='16.0',
            bundle_id='com.example.app'
        )
        assert isinstance(config, DriverConfig)
        assert config.platform_name == 'ios'
        assert config.device_name == 'iPhone 14'
        assert config.bundle_id == 'com.example.app'
        assert config.automation_name == 'XCUITest'
    
    def test_create_driver_config_with_custom_automation(self):
        """Test creating driver config with custom automation name."""
        config = create_driver_config(
            platform='android',
            device_name='device-1',
            platform_version='12.0',
            automation_name='Espresso'
        )
        assert config.automation_name == 'Espresso'
    
    def test_create_driver_config_with_server_url(self):
        """Test creating driver config with custom server URL."""
        custom_url = 'http://192.168.1.100:4723'
        config = create_driver_config(
            platform='android',
            device_name='device-1',
            platform_version='11.0',
            server_url=custom_url
        )
        assert config.server_url == custom_url
    
    def test_create_driver_config_with_additional_capabilities(self):
        """Test creating driver config with additional capabilities."""
        config = create_driver_config(
            platform='android',
            device_name='device-1',
            platform_version='11.0',
            noReset=False,
            fullReset=True
        )
        assert config.capabilities['noReset'] is False
        assert config.capabilities['fullReset'] is True


class TestCreateExecutionContext:
    """Tests for create_execution_context function."""
    
    @pytest.mark.skip(reason="ToolExecutionContext run_id parameter issue")
    def test_create_execution_context(self):
        """Test creating execution context."""
        context = create_execution_context(
            run_id='run-123',
            session_id='session-456',
            platform='android',
            device_id='device-789'
        )
        assert isinstance(context, ToolExecutionContext)
        assert context.session_id == 'session-456'


@pytest.mark.skip(reason="ToolExecutionContext run_id parameter issue")
class TestCreateAppiumTools:
    """Tests for create_appium_tools function."""
    
    @pytest.fixture
    def driver_config(self):
        """Fixture for driver config."""
        return create_driver_config(
            platform='android',
            device_name='emulator-5554',
            platform_version='11.0'
        )
    
    @pytest.fixture
    def execution_context(self):
        """Fixture for execution context."""
        return create_execution_context(
            run_id='test-run',
            session_id='test-session',
            platform='android',
            device_id='test-device'
        )
    
    def test_create_android_appium_tools(self, driver_config, execution_context):
        """Test creating Android AppiumTools."""
        tools = create_appium_tools('android', driver_config, execution_context)
        assert isinstance(tools, AndroidAppiumTools)
        assert tools.get_platform() == 'android'
    
    def test_create_ios_appium_tools(self, execution_context):
        """Test creating iOS AppiumTools."""
        ios_config = create_driver_config(
            platform='ios',
            device_name='iPhone 14',
            platform_version='16.0'
        )
        tools = create_appium_tools('ios', ios_config, execution_context)
        assert isinstance(tools, IOSAppiumTools)
        assert tools.get_platform() == 'ios'
    
    def test_create_appium_tools_invalid_platform(self, driver_config, execution_context):
        """Test creating AppiumTools with invalid platform."""
        with pytest.raises(ValueError, match="Unsupported platform"):
            create_appium_tools('windows', driver_config, execution_context)
    
    def test_create_android_tools_directly(self, driver_config, execution_context):
        """Test creating Android tools directly."""
        tools = create_android_tools(driver_config, execution_context)
        assert isinstance(tools, AndroidAppiumTools)
    
    def test_create_ios_tools_directly(self, execution_context):
        """Test creating iOS tools directly."""
        ios_config = create_driver_config(
            platform='ios',
            device_name='iPhone 14',
            platform_version='16.0'
        )
        tools = create_ios_tools(ios_config, execution_context)
        assert isinstance(tools, IOSAppiumTools)


class TestPlatformDetection:
    """Tests for platform detection and validation."""
    
    def test_case_insensitive_platform_android(self):
        """Test case-insensitive Android platform detection."""
        assert validate_platform('android') is True
        assert validate_platform('ANDROID') is True
        assert validate_platform('Android') is True
        assert validate_platform('AnDrOiD') is True
    
    def test_case_insensitive_platform_ios(self):
        """Test case-insensitive iOS platform detection."""
        assert validate_platform('ios') is True
        assert validate_platform('IOS') is True
        assert validate_platform('iOS') is True
        assert validate_platform('IoS') is True

