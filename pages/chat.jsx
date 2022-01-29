/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import {
  Box, Text, TextField, Image, Button,
} from '@skynexui/components';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import appConfig from '../config.json';
import ButtonSendSticker from '../src/components/ButtonSendSticker';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzI4NTg1OCwiZXhwIjoxOTU4ODYxODU4fQ.-nkzpY58Pk50Lkb0QhgLMg9zMa9aBN_21WEdWAro_aA';
const SUPABASE_URL = 'https://vymvhblkijwzsrzdiaff.supabase.co';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagemTempoReal(adicionaMensagem) {
  return supabaseClient
    .from('mensagens')
    .on('INSERT', (novaMensagem) => {
      adicionaMensagem(novaMensagem.new);
    }).subscribe();
}

function ChatPage() {
  const roteamento = useRouter();
  const [campoMensagem, setCampoMensagem] = useState('');
  const [listaMensagem, setListaMensagem] = useState([]);
  const usuarioLogado = roteamento.query.username;

  function handlerNovaMensagem(novaMensagem) {
    const mensagem = {
      id: listaMensagem.length + 1,
      from: usuarioLogado,
      texto: novaMensagem,
    };

    supabaseClient
      .from('mensagens')
      .insert([mensagem])
      .then(() => { });

    setCampoMensagem('');
  }

  useEffect(() => {
    supabaseClient
      .from('mensagens')
      .select('*')
      .order('id', { ascending: false })
      .then(({ data }) => {
        setListaMensagem(data);
      });

    escutaMensagemTempoReal((novaMensagem) => {
      setListaMensagem((valorAtualListaMensagem) => [novaMensagem, ...valorAtualListaMensagem]);
    });
  }, []);

  return (
    <Box
      styleSheet={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: 'url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundBlendMode: 'multiply',
        color: appConfig.theme.colors.neutrals['000'],
      }}
    >
      <Box
        styleSheet={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
          borderRadius: '5px',
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: '100%',
          maxWidth: '95%',
          maxHeight: '95vh',
          padding: '32px',
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            height: '80%',
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: 'column',
            borderRadius: '5px',
            padding: '16px',
          }}
        >

          <MessageList mensagens={listaMensagem} />

          <Box
            as="form"
            styleSheet={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              value={campoMensagem}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: '100%',
                border: '0',
                resize: 'none',
                borderRadius: '5px',
                padding: '6px 8px',
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: '12px',
                color: appConfig.theme.colors.neutrals[200],
              }}
              onChange={(event) => {
                setCampoMensagem(event.target.value);
              }}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handlerNovaMensagem(campoMensagem);
                }
              }}
            />
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                handlerNovaMensagem(`:sticker: ${sticker}`);
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header() {
  return (
    <Box styleSheet={{
      width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}
    >
      <Text variant="heading5">
        Chat
      </Text>
      <Button
        variant="tertiary"
        colorVariant="neutral"
        label="Logout"
        href="/"
      />
    </Box>
  );
}

function MessageList({ mensagens }) {
  return (
    <Box
      tag="ul"
      styleSheet={{
        overflow: 'scroll',
        display: 'flex',
        flexDirection: 'column-reverse',
        flex: 1,
        color: appConfig.theme.colors.neutrals['000'],
        marginBottom: '16px',
      }}
    >
      {mensagens.map((umaMensagem) => (
        <Text
          key={umaMensagem.id}
          tag="li"
          styleSheet={{
            borderRadius: '5px',
            padding: '6px',
            marginBottom: '12px',
            hover: {
              backgroundColor: appConfig.theme.colors.neutrals[700],
            },
          }}
        >
          <Box
            styleSheet={{
              marginBottom: '8px',
            }}
          >
            <Image
              styleSheet={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: '8px',
              }}
              src={`https://github.com/${umaMensagem.from}.png`}
            />
            <Text tag="strong">
              {umaMensagem.from}
            </Text>
            <Text
              styleSheet={{
                fontSize: '10px',
                marginLeft: '8px',
                color: appConfig.theme.colors.neutrals[300],
              }}
              tag="span"
            >
              {(new Date().toLocaleDateString())}
            </Text>
          </Box>

          {umaMensagem.texto.startsWith(':sticker:')
            ? (
              <Image src={umaMensagem.texto.replace(':sticker:', '')} />
            )
            : (
              umaMensagem.texto
            )}
        </Text>
      ))}
    </Box>
  );
}

export default ChatPage;
