import { useState, useEffect } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Image,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { getUrl } from "aws-amplify/storage";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */

Amplify.configure(outputs);
const client = generateClient({
  authMode: "userPool",
});

export default function App() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const { data: notes } = await client.models.Note.list();
    await Promise.all(
      notes.map(async (note) => {
        if (note.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${note.image}`,
          });
          console.log(linkToStorageFile.url);
          note.image = linkToStorageFile.url;
        }
        return note;
      })
    );
    console.log(notes);
    setNotes(notes);
  }

  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    console.log(form.get("image").name);

    const { data: newNote } = await client.models.Note.create({
      name: form.get("name"),
      description: form.get("description"),
      image: form.get("image").name,
    });

    console.log(newNote);
    if (newNote.image)
      if (newNote.image)
        await uploadData({
          path: ({ identityId }) => `media/${identityId}/${newNote.image}`,

          data: form.get("image"),
        }).result;

    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    const toBeDeletedNote = {
      id: id,
    };

    const { data: deletedNote } = await client.models.Note.delete(
      toBeDeletedNote
    );
    console.log(deletedNote);

    fetchNotes();
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <>
        <div className="flex-1 p-0 m-0 w-screen h-screen text-black flex flex-col"
          
          >
          <div className="bg-blue-300 p-2 flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-blue-800">
              Notes App
            </h1>
            <div className="p-2 ">
              <button onClick={signOut}
                className="text-base font-medium p-2 shadow rounded text-white bg-red-500 "
                >
                  Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1 flex border-t-2">
            <div className="p-4 w-4/12 h-full border-r-2 ">
              <h4 className="text-xl font-medium text-center bg-blue-200 rounded p-2 ">
                Add Note
              </h4>
              <div className="p-2  ">
              <form onSubmit={createNote} className="space-y-6">
                <div className="flex flex-col space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Note Name</label>
                    <input
                      name="name"
                      placeholder="Note Name"
                      id="name"
                      className="mt-2 p-3 border border-gray-300 rounded-md w-full"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Note Description</label>
                    <input
                      name="description"
                      placeholder="Note Description"
                      id="description"
                      className="mt-2 p-3 border border-gray-300 rounded-md w-full"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">Note Image (optional)</label>
                    <input
                      name="image"
                      type="file"
                      id="image"
                      accept="image/png, image/jpeg"
                      className="mt-2 p-3 border border-gray-300 rounded-md w-full"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Create Note
                  </button>
                </div>
              </form>
              <div className="opacity-50 p-4 text-base font-base text-center">
                Developed By Group 15
              </div>
              </div>
            </div>
            <div className="flex-1 w-8/12 p-4">

              <h4 className="text-lg text-center font-medium">
                My Notes
              </h4>
              <div className="flex flex-wrap gap-2 ">
                {notes.map((note) => (
                  <div key={note.id || note.name} 
                    className="flex flex-col border rounded w-48  shadow" >
                    {note.image && (
                        <img 
                          src={note.image}
                          alt={`visual aid for ${notes.name}`}
                          // style={{ width: 100, height: 100 }}
                          className="object-cover rounded-t h-48 w-48"
                        />
                      )}
                      <div className="p-2 flex-1">
                        <div className="max-h-16 ">
                          <h2 className="capitalize text-base font-medium border-b-[1px]">
                            {note.name}
                          </h2>
                        </div>
                        <div className="max-h-48 overflow-auto">
                          <p className="capitalize  text-sm font-normal ">
                            {note.description}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => deleteNote(note)} 
                        className="p-2 w-full text-sm font-medium bg-red-500 rounded-b text-white">
                          Delete
                      </button>
                  </div>
                ))}
              </div>
              {notes.length == 0 && (
                <div className="w-full h-full flex justify-center items-center">
                  <p > Empty</p>
                </div>
              )}
            </div>
          </div>
        </div>

         {/* <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
        >

          <Heading level={1}>My Notes App</Heading>

          <View as="form" margin="3rem 0" onSubmit={createNote}>
            <Flex
              direction="column"
              justifyContent="center"
              gap="2rem"
              padding="2rem"
            >
              <TextField
                name="name"
                placeholder="Note Name"
                label="Note Name"
                labelHidden
                variation="quiet"
                required
              />
              <TextField
                name="description"
                placeholder="Note Description"
                label="Note Description"
                labelHidden
                variation="quiet"
                required
              />
              <View
                name="image"
                as="input"
                type="file"
                alignSelf={"end"}
                accept="image/png, image/jpeg"
              />

              <Button type="submit" variation="primary">
                Create Note
              </Button>
            </Flex>
          </View>

          <Divider />
          <Heading level={2}>Current Notes</Heading>
          <Grid
            margin="3rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="2rem"
            alignContent="center"
          >
            {notes.map((note) => (
              <Flex
                key={note.id || note.name}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="2rem"
                border="1px solid #ccc"
                padding="2rem"
                borderRadius="5%"
                className="box"
              >
                <View>
                  <Heading level="3">{note.name}</Heading>
                </View>
                <Text fontStyle="italic">{note.description}</Text>
                {note.image && (
                  <Image
                    src={note.image}
                    alt={`visual aid for ${notes.name}`}
                    style={{ width: 400 }}
                  />
                )}
                <Button
                  variation="destructive"
                  onClick={() => deleteNote(note)}
                >
                  Delete note
                </Button>
              </Flex>
            ))}
          </Grid>
          <Button onClick={signOut}>Sign Out</Button>
        </Flex>  */}
        </>

      )}
    </Authenticator>
  );
}