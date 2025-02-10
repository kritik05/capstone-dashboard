import React,{useContext,useEffect} from 'react';
import { Button, Card, Typography,Row,Col } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

import myLogo from '../assets/armorcode_logo_mini1.png';
import loginIllustration from '../assets/home.png';

export default function Login() {
    const { user} = useContext(UserContext);
    const navigate = useNavigate();
    const authenticated=user?.authenticated;
    useEffect(() => {
        if (authenticated) {
            navigate('/finding');
        }
      },[authenticated,navigate]);

  return (
    <Row style={styles.container}>
    <Col xs={24} md={8} style={styles.leftCol}>
      <div style={styles.contentWrapper}>
        <img src={myLogo} alt="My Logo" style={styles.logo} />
        <Title level={2} style={styles.title}>Welcome Back</Title>
        <Paragraph style={styles.paragraph}>
          Sign in with your Google account to continue.
        </Paragraph>
        <a href="http://localhost:8083/oauth2/authorization/google">
          <Button
            type="primary"
            icon={<GoogleOutlined />}
            size="large"
            style={styles.signInButton}
          >
            Sign in with Google
          </Button>
        </a>
      </div>
    </Col>

    <Col xs={0} md={16} style={styles.rightCol}>
      <img
        src={loginIllustration}
        alt="Login Illustration"
        style={styles.illustration}
      />
    </Col>
  </Row>
  );
}

const styles = {
  container: {
    height: '100vh',
    overflow: 'hidden',
  },
  leftCol: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
  },
  rightCol: {
    background: '#fafbfc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    maxWidth: 400,
    width: '100%',
    padding: '2rem',
    textAlign: 'center',
  },
  logo: {
    maxWidth: 120,
    marginBottom: '1.5rem',
  },
  title: {
    marginBottom: '1rem',
  },
  paragraph: {
    marginBottom: '2rem',
  },
  signInButton: {
    width: '100%',
    fontSize: '1rem',
  },
  illustration: {
    width: '80%',      
    maxWidth: 800,   
    objectFit: 'contain',
  },
};
