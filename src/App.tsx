import React, { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import Icon from './components/Icon'
import Input from './components/Input'
import Button from './components/Button'
import './App.css' // Import CSS for styles

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import download from "downloadjs";
import { create } from "xmlbuilder2";

async function createPdf() {
	const pdfDoc = await PDFDocument.create()
	const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  
	const page = pdfDoc.addPage()
	const { width, height } = page.getSize()
	const fontSize = 30
	page.drawText('Creating PDFs in JavaScript is awesome!', {
	  x: 50,
	  y: height - 4 * fontSize,
	  size: fontSize,
	  font: timesRomanFont,
	  color: rgb(0, 0.53, 0.71),
	})
  
	// Generate XML content
	const xmlContent = create({ version: "1.0", encoding: "UTF-8" })
	.ele("rsm:CrossIndustryInvoice", {
	"xmlns:rsm": "urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100",
	"xmlns:ram": "urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100",
	})
	.ele("rsm:ExchangedDocument")
	.ele("ram:ID")
	.txt('Number 1')
	.up()
	.ele("ram:Buyer")
	.ele("ram:Name")
	.txt('Maxwell')
	.end({ prettyPrint: true });

	// Convert XML to Uint8Array
	const xmlBytes = new TextEncoder().encode(xmlContent);

	// Embed the XML file as an attachment
	await pdfDoc.attach(xmlBytes, 'xrechnung.xml', {
		mimeType: 'application/xml',
		description: 'XRechnung XML Invoice'
	});

	const pdfBytes = await pdfDoc.save()
	
	// Trigger the browser to download the PDF document
	download(pdfBytes, "pdf-lib_creation_example.pdf", "application/pdf");
}



const App: React.FC = () => {
	const [rectCount, setRectCount] = useState<number>(5)
	const [nodeCount, setNodeCount] = useState<number>(0)

	const createRectangles = (count: number) => {
		window.parent.postMessage(
			{
				pluginMessage: {
					type: 'CREATE_RECTANGLES',
					count,
				},
			},
			'*',
		)
	}

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data.pluginMessage
			if (message?.type === 'POST_NODE_COUNT') {
				setNodeCount(message.count)
			}
		}

		window.addEventListener('message', handleMessage)
		return () => {
			window.removeEventListener('message', handleMessage)
		}
	}, [])

	return (
		<div className="container">
			<div className="banner">
				<Icon svg="plugma" size={38} />
				<Icon svg="plus" size={24} />
				<img src={reactLogo} width="44" height="44" alt="Svelte logo" />
			</div>

			<div className="field create-rectangles">
				<Input
					type="number"
					value={rectCount}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRectCount(Number(e.target.value))}
				/>
				<Button onClick={() => createRectangles(rectCount)}>Create Rectangles</Button>
				<Button onClick={() => createPdf()}>Create PDF</Button>
			</div>
		</div>
	)
}

export default App
