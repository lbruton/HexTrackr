# Firecrawl MCP Server

## Overview

The Firecrawl MCP server provides comprehensive web crawling, scraping, mapping, and structured data extraction capabilities. It's designed for gathering information from websites with LLM-powered data extraction and processing.

## Key Capabilities

- **Web Crawling**: Extract content from multiple related pages on websites
- **Single Page Scraping**: Powerful and reliable single-page content extraction
- **Website Mapping**: Discover all indexed URLs on a website
- **Structured Data Extraction**: LLM-powered extraction of specific data like prices, products
- **Web Search**: Find specific information across multiple websites
- **Batch Processing**: Handle multiple URLs efficiently with proper rate limiting

## Tool Selection Guidelines

- **firecrawl_crawl**: Use for comprehensive multi-page content extraction (avoid for single pages)
- **firecrawl_scrape**: Best for single-page content when you know the exact URL
- **firecrawl_map**: Discover website structure before scraping (don't use if URL known)
- **firecrawl_extract**: Extract specific structured data using LLM capabilities
- **firecrawl_search**: Find information across multiple websites with broad queries

## HexTrackr Use Cases

- **Threat Intelligence**: Scrape security vendor sites for vulnerability information
- **Integration Research**: Research ServiceNow API documentation and examples
- **Compliance Monitoring**: Monitor security advisory sites for relevant updates
- **Technology Research**: Gather information on security frameworks and best practices
- **Vendor Analysis**: Research vulnerability scanner capabilities and data formats

## Best Practices

- Set appropriate limits to avoid token overflow
- Use 'map' then 'batch_scrape' for better control when needed
- Leverage structured extraction for specific data requirements
- Choose the right tool based on whether you need single page vs. comprehensive coverage
- Be mindful of rate limiting and website terms of service
- Use search for broad information discovery across multiple sites

## Integration with HexTrackr Workflows

- **Security Research**: Gather threat intelligence and vulnerability data
- **Documentation Enhancement**: Research best practices for security documentation
- **Vendor Integration**: Research API documentation and integration patterns
- **Compliance Updates**: Monitor regulatory and compliance requirement changes
- **Technology Evaluation**: Research new security tools and frameworks
