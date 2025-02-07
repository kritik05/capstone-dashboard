import React from 'react';
import { Descriptions, Tag } from 'antd';

const severityColorMap = {
  CRITICAL: 'red',
  HIGH: 'volcano',
  MEDIUM: 'orange',
  LOW: 'green',
  INFO: 'blue',
};

const statusColorMap = {
  OPEN: 'green',
  CLOSED: 'geekblue',
  FALSE_POSITIVE: 'red',
  SUPPRESSED: 'orange',
  FIXED: 'purple',
  CONFIRM: 'magenta',
};

const AdditionalFinding = ({ finding }) => {
  if (!finding) {
    return <p>No data</p>;
  }

  const severityColor = severityColorMap[finding.severity] || 'default';
  const statusColor = statusColorMap[finding.status] || 'default';

  return (
    <Descriptions
      title="Finding Details"
      bordered
      column={1}
      size="small"
      style={{ marginTop: 16 }}
    >
    <Descriptions.Item label="Alert Id">
        {finding.additionalData.number}
      </Descriptions.Item>
      <Descriptions.Item label="Title">
        {finding.title}
      </Descriptions.Item>

      <Descriptions.Item label="Tool Type">
        {finding.toolType}
      </Descriptions.Item>

      <Descriptions.Item label="Severity">
        <Tag color={severityColor}>{finding.severity}</Tag>
      </Descriptions.Item>

      <Descriptions.Item label="Status">
        <Tag color={statusColor}>{finding.status}</Tag>
      </Descriptions.Item>

      <Descriptions.Item label="Description">
        {finding.description}
      </Descriptions.Item>

      <Descriptions.Item label="CWE">
        {finding.cwe}
      </Descriptions.Item>

      <Descriptions.Item label="CVE">
        {finding.cve}
      </Descriptions.Item>

      <Descriptions.Item label="CVSS">
        {finding.cvss}
      </Descriptions.Item>

      <Descriptions.Item label="URL">
        {finding.url ? (
          <a href={finding.url} target="_blank" rel="noopener noreferrer">
            {finding.url}
          </a>
        ) : (
          'N/A'
        )}
      </Descriptions.Item>

      <Descriptions.Item label="Location">
        {finding.location}
      </Descriptions.Item>
    </Descriptions>
  );
};

export default AdditionalFinding;
