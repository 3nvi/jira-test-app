import api, { route } from '@forge/api';
import ForgeUI, { render, Text, AdminPage, TextField, useEffect, useState, Form } from '@forge/ui';
import { storage } from '@forge/api';

export async function runCreateComment(event, context) {
  const sec = await storage.getSecret('panther_token');
  const response = await addComment(
    event.issue.id,
    `Hello World! It's the Comment Issue app. Your secret is ${sec}`
  );

  console.log(`Response: ${JSON.stringify(response)}`);
}

const App = () => {
  return (
    <AdminPage>
      <Text>Hello, world! Let's get started</Text>
    </AdminPage>
  );
};
export const runGetStarted = render(<App />);

const App2 = () => {
  const [secret, setSecret] = useState('');
  useEffect(async () => {
    const sec = await storage.getSecret('panther_token');
    setSecret(sec || '');
  }, []);

  const onSubmit = data => {
    return storage.setSecret('panther_token', data.pantherSecret);
  };

  return (
    <AdminPage>
      <Text>Hello, world! Let's configure stuff</Text>
      <Form onSubmit={onSubmit} submitButtonText="Save">
        <TextField
          label="Panther Secret"
          name="pantherSecret"
          type="password"
          placeholder="*************"
        />
      </Form>
      {secret ? <Text>The secret is {secret}</Text> : null}
    </AdminPage>
  );
};
export const runConfig = render(<App2 />);

const App3 = () => {
  return (
    <AdminPage>
      <Text>Hello, world! Let's show a generic admin page</Text>
    </AdminPage>
  );
};
export const runAdmin = render(<App3 />);
async function addComment(issueIdOrKey, message) {
  /**
   * @issueIdOrKey - the Jira issueId number or key for the issue that this function will try to add
   * a comment to (as per the Jira Rest API)
   * @message {string} - the message that will appear in the comment
   *
   * @example addComment('10050', 'Hello world')
   */

  // You'll come back to this later
  // See https://developer.atlassian.com/cloud/jira/platform/rest/v3/#api-rest-api-3-issue-issueIdOrKey-comment-post
  // IssueIDOrKey: The ID or key of the issue.
  const requestUrl = route`/rest/api/3/issue/${issueIdOrKey}/comment`;
  const body = {
    body: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              text: message,
              type: 'text',
            },
          ],
        },
      ],
    },
  };

  // Use the Forge Runtime API to fetch data from an HTTP server using your (the app developer) Authorization header
  let response = await api.asApp().requestJira(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  // Error checking: the Jira issue comment Rest API returns a 201 if the request is successful
  if (response.status !== 201) {
    console.log(response.status);
    throw `Unable to add comment to issueId ${issueIdOrKey} Status: ${response.status}.`;
  }

  return response.json();
}
