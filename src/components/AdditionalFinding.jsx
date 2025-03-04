import React from 'react';
import { Descriptions, Tag, Button, Space, Modal, Form, Input, message } from 'antd';
import { useState } from 'react';
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

function statusClosed(status) {
  return ["CLOSED", "FALSE_POSITIVE", "SUPPRESSED", "FIXED", "CONFIRM"].includes(status);
}

const { TextArea } = Input;

const AdditionalFinding = ({ finding,onCreateTicket,onViewTicket }) => {
  if (!finding) {
    return <p>No data</p>;
  }

  const severityColor = severityColorMap[finding.severity] || 'default';
  const statusColor = statusColorMap[finding.status] || 'default';
  const isTicketCreated = !!finding.ticketId;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState(finding.title || '');
  const [description, setDescription] = useState(finding.description || '');

  const createTicketbtn = statusClosed(finding.status?.toString());

  const handleOpenModal = () => {
    // Reset or prefill from the finding each time we open
    setSummary(finding.title || '');
    setDescription(finding.description || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  const handleCreate = async () => {
    try {
      // Call the parent's createTicket method, passing the updated summary/description
      await onCreateTicket(finding, summary, description);
      handleCloseModal();
    } catch (err) {
      message.error(err.message);
    }
  };

  return (
    <div>
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

    <div style={{ marginTop: 16 }}>
    <Space>
      {/* Create or View Ticket Button */}
      {!isTicketCreated && !createTicketbtn? (
        <Button type="primary" onClick={handleOpenModal}>
        Create Ticket
      </Button>
      ) : isTicketCreated ? (
        <Button onClick={() => onViewTicket(finding)}>View Ticket</Button>
      ) : null}
    </Space>
    </div>
    <Modal
        title="Create Ticket"
        open={isModalOpen}
        onOk={handleCreate}
        onCancel={handleCloseModal}
        okText="Create"
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="Summary">
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Description">
            <TextArea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
    
  );
};

export default AdditionalFinding;
