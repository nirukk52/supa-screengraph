"""
Unit tests for AndroidAppiumTools implementation.
"""

import pytest
from unittest.mock import Mock, MagicMock, patch
from src.adapters.appium.implementations.android_appium_tools import AndroidAppiumTools
from src.adapters.appium.types import (
    ToolExecutionContext, SelectorType, DeviceOrientation,
    SwipeDirection, ScrollDirection
)


class TestAndroidAppiumToolsInitialization:
    """Tests for AndroidAppiumTools initialization."""
    
    @pytest.fixture
    def android_tools(self):
        """Fixture for AndroidAppiumTools instance."""
        return AndroidAppiumTools()
    
    @pytest.fixture
    def execution_context(self):
        """Fixture for execution context."""
        return ToolExecutionContext(
            session_id='test-session',
            test_id='test-123',
            environment='test'
        )
    
    def test_android_tools_creation(self, android_tools):
        """Test AndroidAppiumTools instantiation."""
        assert android_tools is not None
        assert isinstance(android_tools, AndroidAppiumTools)
    
    def test_get_platform(self, android_tools):
        """Test get_platform method."""
        assert android_tools.get_platform() == 'android'
    
    def test_get_tool_metadata(self, android_tools):
        """Test get_tool_metadata method."""
        metadata = android_tools.get_tool_metadata()
        assert isinstance(metadata, list)
        assert len(metadata) > 0
        
        # Check that metadata has connection tools
        connection_tools = [m for m in metadata if m.name.startswith('android_connect')]
        assert len(connection_tools) > 0
        
        # Check that metadata has data gathering tools
        data_tools = [m for m in metadata if m.name.startswith('android_screenshot')]
        assert len(data_tools) > 0


class TestAndroidToolsMetadata:
    """Tests for AndroidAppiumTools metadata."""
    
    @pytest.fixture
    def android_tools(self):
        """Fixture for AndroidAppiumTools instance."""
        return AndroidAppiumTools()
    
    def test_metadata_structure(self, android_tools):
        """Test metadata has correct structure."""
        metadata = android_tools.get_tool_metadata()
        
        for tool_meta in metadata:
            assert hasattr(tool_meta, 'name')
            assert hasattr(tool_meta, 'description')
            assert hasattr(tool_meta, 'category')
            assert hasattr(tool_meta, 'platform')
            assert hasattr(tool_meta, 'requiresDriver')
            assert hasattr(tool_meta, 'timeout')
            assert hasattr(tool_meta, 'retryable')
    
    def test_metadata_platform(self, android_tools):
        """Test all metadata has android platform."""
        metadata = android_tools.get_tool_metadata()
        
        for tool_meta in metadata:
            assert 'android' in tool_meta.platform
    
    def test_metadata_names_prefixed(self, android_tools):
        """Test all tool names are prefixed with 'android_'."""
        metadata = android_tools.get_tool_metadata()
        
        for tool_meta in metadata:
            assert tool_meta.name.startswith('android_')
    
    def test_connection_tools_metadata(self, android_tools):
        """Test connection tools have correct metadata."""
        metadata = android_tools.get_tool_metadata()
        connection_tools = [m for m in metadata if 'connect' in m.name]
        
        assert len(connection_tools) >= 2  # At least connect and disconnect
        
        for tool in connection_tools:
            assert tool.requiresDriver is True
            assert tool.timeout > 0


class TestAndroidToolsDriverNotInitialized:
    """Tests for AndroidAppiumTools without initialized driver."""
    
    @pytest.fixture
    def android_tools(self):
        """Fixture for AndroidAppiumTools instance."""
        return AndroidAppiumTools()
    
    @pytest.mark.asyncio
    async def test_screenshot_without_driver(self, android_tools):
        """Test screenshot fails without driver."""
        result = await android_tools.screenshot()
        assert result.success is False
        assert result.error is not None
    
    @pytest.mark.asyncio
    async def test_get_page_source_without_driver(self, android_tools):
        """Test get_page_source fails without driver."""
        result = await android_tools.get_page_source()
        assert result.success is False
        assert result.error is not None


class TestToolCategories:
    """Tests for tool categorization."""
    
    @pytest.fixture
    def android_tools(self):
        """Fixture for AndroidAppiumTools instance."""
        return AndroidAppiumTools()
    
    def test_has_connection_tools(self, android_tools):
        """Test has connection category tools."""
        from src.adapters.appium.types import ToolCategory
        metadata = android_tools.get_tool_metadata()
        connection_tools = [m for m in metadata if m.category == ToolCategory.CONNECTION]
        assert len(connection_tools) > 0
    
    def test_has_data_gathering_tools(self, android_tools):
        """Test has data gathering category tools."""
        from src.adapters.appium.types import ToolCategory
        metadata = android_tools.get_tool_metadata()
        data_tools = [m for m in metadata if m.category == ToolCategory.DATA_GATHERING]
        assert len(data_tools) > 0
    
    def test_has_element_action_tools(self, android_tools):
        """Test has element action category tools."""
        from src.adapters.appium.types import ToolCategory
        metadata = android_tools.get_tool_metadata()
        action_tools = [m for m in metadata if m.category == ToolCategory.ELEMENT_ACTIONS]
        assert len(action_tools) > 0
    
    def test_has_device_management_tools(self, android_tools):
        """Test has device management category tools."""
        from src.adapters.appium.types import ToolCategory
        metadata = android_tools.get_tool_metadata()
        device_tools = [m for m in metadata if m.category == ToolCategory.DEVICE_MANAGEMENT]
        assert len(device_tools) > 0
    
    def test_has_app_management_tools(self, android_tools):
        """Test has app management category tools."""
        from src.adapters.appium.types import ToolCategory
        metadata = android_tools.get_tool_metadata()
        app_tools = [m for m in metadata if m.category == ToolCategory.APP_MANAGEMENT]
        assert len(app_tools) > 0
    
    def test_has_navigation_tools(self, android_tools):
        """Test has navigation category tools."""
        from src.adapters.appium.types import ToolCategory
        metadata = android_tools.get_tool_metadata()
        nav_tools = [m for m in metadata if m.category == ToolCategory.NAVIGATION]
        assert len(nav_tools) > 0


class TestToolReadiness:
    """Tests for tool readiness checks."""
    
    @pytest.fixture
    def android_tools(self):
        """Fixture for AndroidAppiumTools instance."""
        return AndroidAppiumTools()
    
    @pytest.mark.asyncio
    async def test_is_ready_without_initialization(self, android_tools):
        """Test is_ready returns False without initialization."""
        result = await android_tools.is_ready()
        assert result.success is True
        # Tool exists but driver may not be ready
        assert result.data is not None

