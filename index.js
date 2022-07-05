const express = require("express");
const axios = require("axios");

const app = express();

const getTagInnerHTML = (unparsedHTMLString, startStr, endStr) => {
  console.log(startStr, endStr);
  let refinedSearch = unparsedHTMLString.substring(unparsedHTMLString.indexOf(startStr) + startStr.length);
  let finalSearch = refinedSearch.substring(0, refinedSearch.indexOf(endStr))
  return finalSearch;
}

const getInnerHTMLAndRemove = (unparsedHTMLString, startStr, endStr) => {
  if(unparsedHTMLString.indexOf(endStr) == -1){
    return null;
  }
  let returnValue = [getTagInnerHTML(unparsedHTMLString, startStr, endStr)];
  let suffix = unparsedHTMLString.substring(unparsedHTMLString.indexOf(endStr) + endStr.length);
  returnValue.push(suffix);
  return returnValue;
};

app.get("/getTimeStories", (req, res) => {
  axios.get("http://time.com/")
    .then(timeRes => {
      // console.log(res)
      if(!timeRes.data){
        throw new Error("empty response by time.com")
      }
      htmlData = timeRes.data;
      let feedContainerInnerHTML = getTagInnerHTML(htmlData, '<ul class=\"most-popular-feed__item-container\">', '</ul>');
      let feedItems = [];
      while(true){
        let innnerAndNewHtml = getInnerHTMLAndRemove(feedContainerInnerHTML, '<li class=\"most-popular-feed__item\">', "</li>");
        if(!innnerAndNewHtml){
          break;
        }
        listItemInnerHTML = innnerAndNewHtml[0];
        innerDivInnerHTML = getTagInnerHTML(listItemInnerHTML, "<div>", "</div>")
        relativeLink = getTagInnerHTML(innerDivInnerHTML, `<a href="`, `"`)
        feedTitle = getTagInnerHTML(innerDivInnerHTML, `<h3 class="most-popular-feed__item-headline">`, "</h3>");
        feedItems.push({
          link: "https://time.com" + relativeLink, 
          title: feedTitle
        });
        feedContainerInnerHTML = innnerAndNewHtml[1];
      }
      res.send(feedItems)
    })
    .catch(err => {
      console.log("err", err)
      res.send({error: "error in axios get: " + err.message})
    })
})

app.listen(4000, ()=> {
  console.log("local app running on port 4000");
})