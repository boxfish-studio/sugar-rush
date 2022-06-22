---
name: Found a bug?
description: Please use this form to report a bug
title: '[Bug report]: '
labels: 'bug report'

body:
    - type: markdown
      attributes:
          value: '## Device details'
    - type: dropdown
      id: device
      attributes:
          label: Device type
          description: What kind of device does this issue occur on?
          multiple: true
          options:
            - Desktop
            - Mobile
      validations:
          required: true   
    - type: dropdown
      id: os
      attributes:
          label: Operating System
          description: Which OS does this issue occur on?
          multiple: true
          options:
            - Linux
            - Mac
            - Windows
            - iOS
            - Android
      validations:
          required: true
    - type: input
      id: browser
      attributes:
          label: Browser
          description: What browser are you using?
          placeholder: "Chrome"
      validations:
          required: true
    - type: input
      id: wallet
      attributes:
          label: Browser extension wallet
          description: What browser extension wallet are you using?
          placeholder: "Phantom"
      validations:
          required: true                                           
    - type: markdown
      attributes:
          value: '## Application details'
    - type: input
      id: version
      attributes:
          label: Version
          description: What version are you using?
          placeholder: "1.4.0"
      validations:
          required: false      
    - type: markdown
      attributes:
          value: '## Issue report'
    - type: textarea
      id: description
      attributes:
          label: Description
          description: Briefly describe the issue.
      validations:
          required: true
    - type: dropdown
      id: can_repro
      attributes:
          label: Can the issue reliably be reproduced?
          options:
              - 'Yes'
              - 'No'
      validations:
          required: true
    - type: textarea
      id: repro_steps
      attributes:
          label: Steps to reproduce the issue
          description: Explain how can be reproduced the issue.
          placeholder: |
              1.
              2.
              3.
              ...       
    - type: markdown
      attributes:
          value: '## Declarations'
    - type: checkboxes
      id: duplicate_declaration
      attributes:
          label: Duplicate declaration
          description: Please confirm that you are not creating a duplicate issue.
          options:
              - label: I have searched the issues tracker this issue and there is none
                required: true
