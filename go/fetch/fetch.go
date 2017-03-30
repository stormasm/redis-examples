package main

import (
	"bufio"
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"time"
)

func main() {
	url := "http://127.0.0.1:3000/omdb.json"
	json := getJson(url)
	fmt.Println(len(json))
	doc_chan := getChannel(json)
	count := 0
	for doc := range doc_chan {
		fmt.Println(count, " ", doc)
		count = count + 1
	}
}

func getChannel(json []byte) <-chan string {
	doc_chan := make(chan string)
	go func() {
		reader := bytes.NewReader(json)
		scanner := bufio.NewScanner(reader)
		count := 0
		var doc string
		for scanner.Scan() {
			evenodd := count % 2
			if evenodd == 0 {
				scanner.Text()
			} else {
				doc = scanner.Text()
				doc_chan <- doc
			}
			count = count + 1
		}
		if err := scanner.Err(); err != nil {
			fmt.Fprintln(os.Stderr, "reading standard input:", err)
		}
		close(doc_chan)
	}()
	return doc_chan
}

func getJson(url string) (buf []byte) {
	var netClient = &http.Client{
		Timeout: time.Second * 30,
	}
	response, err := netClient.Get(url)
	if err != nil {
		fmt.Println("get: ", err)
	}

	buf, err = ioutil.ReadAll(response.Body)
	if err != nil {
		fmt.Println("ioutil: ", err)
	}
	return buf
}
