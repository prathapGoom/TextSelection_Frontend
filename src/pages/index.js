import React, { useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPencilAlt, faCompressAlt, faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import { Button, Box, Flex, useToast,Text } from '@chakra-ui/react';
import axios from "axios";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import Tippy from '@tippyjs/react'; 
import 'tippy.js/dist/tippy.css';

const Home = () => {

  const [rephraseData,setRephraseData] = useState([]);

  const toast = useToast();
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start typing and select some text to see the custom menu.</p>'
  });

  const handleClick = async (action) => {
    if (!editor) return;

    const { empty, from, to } = editor.state.selection;

    if (empty) {
      toast({
        title: "No text selected",
        description: "Please select some text to apply the transformation.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const text = editor.state.doc.textBetween(from, to, '\n');

    try {
      const response = await fetch('http://localhost:8000/PostText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, option: action })
      });

      const data = await response.json();

      if (response.ok) {
        editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, `${data.data}`).run();
      } else {
        toast({
          title: "Error",
          description: data.message || "An error occurred while processing your request.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Could not connect to the server.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGenerateSampleTexts = async() =>{
    try{
      if (editor) {
        const text = editor.state.doc.textContent;
        const data={
          text:text
        }
        const res = await axios.post('http://localhost:8000/rephrase',data);
        if(res?.data?.status == "success" ){
          const parsedData = JSON.parse(res.data.data);  
                    setRephraseData(parsedData);
        }
        console.log(res)
        console.log(text); 
      } else {
          console.log("Editor is not initialized.");
      }
    }
    catch(error){

    }
  }

  const parseData = (dataString) => {
    return dataString?.replace(/\[\n|\n\]|\n/g, '').split('"\n\n"').map(item => item.trim().replace(/\"/g, ''));
  };

  console.log(rephraseData[0])
  return (
    <>
    <Box display="flex" flexDirection={["column", "column", "row"]}
         width={["100%", "100%", "85%"]}
         boxShadow="1px 1px 6px #00000033"
         height={["700px", "700px", "calc(100vh - 200px)"]}  
         mt={10}
         ml={20}
    >
      <Box width={["100%", "100%", "50%"]} padding="10px 20px 30px 10px"
           height="calc(100% - 30px)"  
           overflow="auto" 
      >
        <Box height={"500px"}>
          {editor && (
            <BubbleMenu editor={editor} tippyOptions={{ placement: 'top-start' }}>
              <Flex bg="white" p={2} border="1px solid black" gap={2}>
              <Tippy content="Correct">
          <Button onClick={() => handleClick('correct')} variant="outline">
            <FontAwesomeIcon icon={faCheck} />
          </Button>
        </Tippy>
        <Tippy content="Elaborate">
          <Button onClick={() => handleClick('elaborate')} variant="outline">
            <FontAwesomeIcon icon={faPencilAlt} />
          </Button>
        </Tippy>
        <Tippy content="Shorten">
          <Button onClick={() => handleClick('shorten')} variant="outline">
            <FontAwesomeIcon icon={faCompressAlt} />
          </Button>
        </Tippy>
        <Tippy content="Rewrite">
          <Button onClick={() => handleClick('rewrite')} variant="outline">
            <FontAwesomeIcon icon={faRedoAlt} />
          </Button>
        </Tippy>
              </Flex>
            </BubbleMenu>
          )}
          <EditorContent editor={editor} style={{height:"100%"}}/>
        </Box>
      </Box>
      <Box width={["100%", "100%", "50%"]} padding="10px 20px 30px 10px"
           height="calc(100% - 30px)"  
           overflow="auto" 
      >

      <Tabs variant='soft-rounded' colorScheme='green'>
        <TabList>
          <Tab>Rephrased Version 1</Tab>
          <Tab>Rephased Vesrion 2</Tab>
          <Tab>Rephrased Vesrion 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {rephraseData[0]}
          </TabPanel>
          <TabPanel>
          {rephraseData[1]}
          </TabPanel>
          <TabPanel>
          {rephraseData[2]}
          </TabPanel>
        </TabPanels>
      </Tabs>

      </Box>
    </Box>
    <Button ml={"5%"} mt={3} onClick={handleGenerateSampleTexts}>Generate</Button>
    </>
  );
};

export default Home;
