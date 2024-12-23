import * as React from 'react'

interface EmailTemplateProps {
  userName: string
  magicLink: string
}

export const EnEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  userName,
  magicLink,
}) => (
  <div>
    <h1>Welcome, {userName}!</h1>
    <p>
      Your magic link is <a href={magicLink}>{magicLink}</a>, click to login!
    </p>
  </div>
)

export const CNEmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  userName,
  magicLink,
}) => (
  <div>
    <h1>欢迎, {userName}!</h1>
    <p>
      你的验证链接是 <a href={magicLink}>{magicLink}</a>, 点击登录!
    </p>
  </div>
)
