/*
 * Copyright (C) 2018 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react'

import {mockAssignment, mockComments, legacyMockSubmission} from '../../test-utils'
import StudentContent from '../StudentContent'
import {MockedProvider} from 'react-apollo/test-utils'
import {SUBMISSION_COMMENT_QUERY, CREATE_SUBMISSION_COMMENT} from '../../assignmentData'
import {waitForElement, render, fireEvent} from 'react-testing-library'

const mocks = [
  {
    request: {
      query: SUBMISSION_COMMENT_QUERY,
      variables: {
        submissionId: legacyMockSubmission().id
      }
    },
    result: {
      data: {
        submissionComments: mockComments()
      }
    }
  },
  {
    request: {
      query: CREATE_SUBMISSION_COMMENT,
      variables: {
        submissionId: legacyMockSubmission().id
      }
    },
    result: {
      data: null
    }
  }
]

describe('Assignment Student Content View', () => {
  it('renders the student header if the assignment is unlocked', () => {
    const assignment = mockAssignment({lockInfo: {isLocked: false}})
    const {getByTestId} = render(
      <MockedProvider>
        <StudentContent assignment={assignment} submission={legacyMockSubmission()} />
      </MockedProvider>
    )
    expect(getByTestId('assignments-2-student-view')).toBeInTheDocument()
  })

  it('renders the student header if the assignment is locked', () => {
    const assignment = mockAssignment({lockInfo: {isLocked: true}})
    const {getByTestId} = render(
      <StudentContent assignment={assignment} submission={legacyMockSubmission()} />
    )
    expect(getByTestId('assignment-student-header-normal')).toBeInTheDocument()
  })

  it('renders the assignment details and student content tab if the assignment is unlocked', () => {
    const assignment = mockAssignment({lockInfo: {isLocked: false}})
    const {getByRole, getByText, queryByText} = render(
      <MockedProvider>
        <StudentContent assignment={assignment} submission={legacyMockSubmission()} />
      </MockedProvider>
    )

    expect(getByRole('tablist')).toHaveTextContent('Upload')
    expect(getByText('Details')).toBeInTheDocument()
    expect(queryByText('Availability Dates')).not.toBeInTheDocument()
  })

  it('renders the availability dates if the assignment is locked', () => {
    const assignment = mockAssignment({lockInfo: {isLocked: true}})
    const {queryByRole, getByText} = render(
      <StudentContent assignment={assignment} submission={legacyMockSubmission()} />
    )

    expect(queryByRole('tablist')).not.toBeInTheDocument()
    expect(getByText('Availability Dates')).toBeInTheDocument()
  })

  it('renders Comments', async () => {
    const assignment = mockAssignment({lockInfo: {isLocked: false}})
    const {getByText} = render(
      <MockedProvider mocks={mocks} addTypename>
        <StudentContent assignment={assignment} submission={legacyMockSubmission()} />
      </MockedProvider>
    )
    fireEvent.click(getByText('Comments', {selector: '[role=tab]'}))

    expect(await waitForElement(() => getByText('Send Comment'))).toBeInTheDocument()
  })

  it('renders spinner while lazy loading comments', () => {
    const assignment = mockAssignment({lockInfo: {isLocked: false}})
    const {getByTitle, getByText} = render(
      <MockedProvider mocks={mocks} addTypename>
        <StudentContent assignment={assignment} submission={legacyMockSubmission()} />
      </MockedProvider>
    )
    fireEvent.click(getByText('Comments', {selector: '[role=tab]'}))
    expect(getByTitle('Loading')).toBeInTheDocument()
  })
})
