/*
 * Copyright (C) 2019 - present Instructure, Inc.
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

import {fireEvent, wait, waitForElement} from 'react-testing-library'
import {mockAssignment, itBehavesLikeADialog, saveAssignmentResult} from '../../../test-utils'
import {renderTeacherView} from './integration-utils'

async function openDeleteDialog(assignment = mockAssignment(), apolloMocks = []) {
  const fns = await renderTeacherView(assignment, apolloMocks)
  const openDeleteButton = await waitForElement(() => fns.getByText('delete assignment'))
  fireEvent.click(openDeleteButton)
  return fns
}

afterEach(() => {
  jest.restoreAllMocks()
})

describe('assignments 2 delete dialog', () => {
  itBehavesLikeADialog({
    render: renderTeacherView,
    getOpenDialogElt: fns => fns.getByText('delete assignment'),
    confirmDialogOpen: fns => fns.getByText(/are you sure/i, {exact: false}),
    getCancelDialogElt: fns => fns.getByTestId('delete-dialog-cancel-button')
  })

  it('deletes the assignment and reloads', async () => {
    const reloadSpy = jest.spyOn(window.location, 'reload')
    const assignment = mockAssignment()
    const {getByTestId} = await openDeleteDialog(assignment, [
      saveAssignmentResult(assignment, {state: 'deleted'}, {state: 'deleted'})
    ])
    const reallyDeleteButton = await waitForElement(() =>
      getByTestId('delete-dialog-confirm-button')
    )
    fireEvent.click(reallyDeleteButton)
    await wait(() => expect(reloadSpy).toHaveBeenCalled())
  })

  it('reports errors', async () => {
    const assignment = mockAssignment()
    const {getByTestId, getByText} = await openDeleteDialog(assignment, [
      saveAssignmentResult(assignment, {state: 'deleted'}, {state: 'deleted'}, 'well rats')
    ])
    const reallyDeleteButton = await waitForElement(() =>
      getByTestId('delete-dialog-confirm-button')
    )
    fireEvent.click(reallyDeleteButton)
    expect(await waitForElement(() => getByText(/unable to delete/i))).toBeInTheDocument()
  })
})
