/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Sie wurden zu ContentLeads eingeladen</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Willkommen bei ContentLeads</Heading>
        <Text style={text}>
          Sie wurden eingeladen, Ihr persönliches Performance-Dashboard auf{' '}
          <Link href={siteUrl} style={link}>
            <strong>ContentLeads</strong>
          </Link>{' '}
          zu nutzen. Klicken Sie auf den Button, um Ihren Account zu aktivieren
          und Ihr Passwort festzulegen.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Einladung annehmen
        </Button>
        <Text style={footer}>
          Falls Sie diese Einladung nicht erwartet haben, können Sie diese E-Mail
          ignorieren.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1a1a2e',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: 'hsl(0, 85%, 55%)',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '16px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
